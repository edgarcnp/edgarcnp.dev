import { readCssNumber, readCssString, resizeCanvas } from "./canvas"
import { IDLE_WAVE } from "./config"
import { createGrainPattern, drawGrain, drawStripe } from "./draw"
import { getRandomWavePhase, isIntroComplete } from "./intro"
import { syncStripeCount } from "./stripe"
import { triggerSpeedUpAnimation, updateSpeedUpAnimation } from "./speedup"

import type { Colors, Stripe, Size, IntroAnimation, GradientShimmerControls } from "~/lib/types"

/**
 * Animated gradient shimmer background canvas, as a Web Component.
 *
 * @remarks
 * - Custom element `<shimmer-background>`; renders its own `<canvas>` child in the light DOM
 *   (child of the host, so global CSS and `--shimmer-*` custom properties apply to it).
 * - Plays the intro animation once per tab session via the `sessionStorage` flag
 *   `edgarcnp:shimmer-intro-played`.
 * - Responds to clicks with a wave speed-up effect.
 * - Re-triggers emphasis on `pagereveal` (back/forward cache restores and view transitions).
 * - Defers initialization to `requestIdleCallback` to avoid blocking first paint.
 * - Degrades gracefully if CSS custom properties are missing (canvas becomes invisible).
 * - Respects `prefers-reduced-motion: reduce` — renders a static frame, no animation.
 * - Resizes via `ResizeObserver` and re-reads CSS colors on theme changes via `MutationObserver`.
 * - Lifecycle: `connectedCallback` initializes; `disconnectedCallback` tears everything down and
 *   is idempotent. Reconnecting after a disconnect re-initializes from scratch; connecting while
 *   already initialized is a no-op.
 */
export class ShimmerBackground extends HTMLElement {
    private canvas: HTMLCanvasElement | null = null
    private shimmerController: GradientShimmerControls | null = null
    private initialized = false
    private idleCallback: number | null = null
    private cleanupFns: (() => void)[] = []

    connectedCallback() {
        if (this.initialized) return

        const classes = [
            this.hasAttribute("background") ? "background" : "",
            this.getAttribute("class") ?? "",
        ].join(" ").trim()

        const canvas = document.createElement("canvas")
        canvas.className = classes
        canvas.setAttribute("aria-hidden", "true")
        this.appendChild(canvas)
        this.canvas = canvas

        const init = () => {
            try {
                const canvas = this.canvas
                if (canvas === null) return

                const context = canvas.getContext("2d", {
                    alpha: true,
                    colorSpace: "display-p3",
                })

                if (!context) return

                const stripes: Stripe[] = []
                const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)")
                const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

                let size: Size = { width: 0, height: 0, dpr: 1 }
                let stripeWidth = 0
                let colors: Colors = {
                    alpha: 0,
                    grainAlpha: 0,
                    grainLuminance: 0,
                    grainContrast: 0,
                    grainSaturation: 0,
                    introAlpha: 0,
                    start: "",
                    highlight: "",
                    speedUpShineBoost: 0,
                }
                let grainPattern: CanvasPattern | null = null
                let animationFrame: number | null = null
                let resizeFrame: number | null = null
                let introAnimation: IntroAnimation | null = null
                let speedUpAnimation: ReturnType<typeof triggerSpeedUpAnimation> | null = null
                let wavePhase = getRandomWavePhase()
                let secondaryWavePhase = -wavePhase * 0.7
                let lastFrameTime: number | null = null

                const registerCleanup = (cleanup: () => void) => {
                    this.cleanupFns.push(cleanup)
                }

                const cancelResizeFrame = () => {
                    if (resizeFrame === null) return
                    cancelAnimationFrame(resizeFrame)
                    resizeFrame = null
                }

                const cancelAnimation = () => {
                    if (animationFrame === null) return
                    cancelAnimationFrame(animationFrame)
                    animationFrame = null
                }

                const startIntro = () => {
                    if (reducedMotionQuery.matches) {
                        introAnimation = null
                        drawFrame(performance.now())
                        return
                    }
                    introAnimation = { startedAt: performance.now() }
                }

                const startWaveSpeedUp = () => {
                    if (reducedMotionQuery.matches) {
                        speedUpAnimation = null
                        drawFrame(performance.now())
                        return
                    }
                    const time = performance.now()
                    speedUpAnimation = triggerSpeedUpAnimation(time, speedUpAnimation)
                }

                const controller: GradientShimmerControls = {
                    intro: startIntro,
                    emphasize: startWaveSpeedUp,
                }

                /**
                 * Read CSS custom properties from the canvas element's computed styles.
                 *
                 * @returns True if all CSS variables were read successfully, false otherwise.
                 *
                 * @remarks On failure, returns false — the caller should skip drawing.
                 */
                const readColors = (): boolean => {
                    try {
                        const styles = getComputedStyle(canvas)
                        colors = {
                            alpha: readCssNumber(styles, "--shimmer-alpha"),
                            grainAlpha: readCssNumber(styles, "--shimmer-grain-alpha"),
                            grainLuminance: readCssNumber(styles, "--shimmer-grain-luminance"),
                            grainContrast: readCssNumber(styles, "--shimmer-grain-contrast"),
                            grainSaturation: readCssNumber(styles, "--shimmer-grain-saturation"),
                            introAlpha: readCssNumber(styles, "--shimmer-intro-alpha"),
                            start: readCssString(styles, "--shimmer-start"),
                            highlight: readCssString(styles, "--shimmer-highlight"),
                            speedUpShineBoost: readCssNumber(styles, "--shimmer-speed-up-shine-boost"),
                        }
                        grainPattern = createGrainPattern(context, colors)
                        return true
                    } catch (e) {
                        console.error("[GradientShimmer] CSS read failed:", e instanceof Error ? e.message : e)
                        return false
                    }
                }

                /**
                 * Apply resize: update canvas buffer, sync stripe count, re-read CSS colors.
                 *
                 * @returns True if resize succeeded, false if CSS read failed.
                 */
                const applyResize = (): boolean => {
                    size = resizeCanvas(canvas, context)
                    stripeWidth = syncStripeCount(stripes, size.width)
                    return readColors()
                }

                /**
                 * Schedule a resize on the next animation frame (debounced by ResizeObserver).
                 */
                const scheduleResize = () => {
                    cancelResizeFrame()
                    resizeFrame = requestAnimationFrame((time) => {
                        if (applyResize()) {
                            drawFrame(time)
                        }
                    })
                }

                /**
                 * Draw a single animation frame — clears canvas, draws all stripes + grain.
                 *
                 * @param time - Current animation timestamp from requestAnimationFrame.
                 *
                 * @remarks
                 * In reduced-motion mode: draws a static frame with no wave progression.
                 * Otherwise: advances wave phases, applies speed-up multiplier, renders intro.
                 */
                const drawFrame = (time: number) => {
                    const reducedMotion = reducedMotionQuery.matches
                    const deltaSeconds = reducedMotion || lastFrameTime === null
                        ? 0
                        : Math.min((time - lastFrameTime) / 1000, 0.064)
                    const speedUpState = updateSpeedUpAnimation(time, speedUpAnimation)
                    const activeIntroAnimation = reducedMotion ? null : introAnimation

                    lastFrameTime = reducedMotion ? null : time
                    speedUpAnimation = reducedMotion ? null : speedUpState.animation

                    if (!reducedMotion) {
                        wavePhase += IDLE_WAVE.speed * speedUpState.multiplier * deltaSeconds
                        secondaryWavePhase += IDLE_WAVE.secondarySpeed * speedUpState.multiplier * deltaSeconds
                    }

                    context.globalAlpha = 1
                    context.clearRect(0, 0, size.width, size.height)

                    const heightTop = size.height * -0.35
                    const heightBottom = size.height * 1.35

                    for (const [index, stripe] of stripes.entries()) {
                        drawStripe(
                            context,
                            stripe,
                            index,
                            stripeWidth,
                            size,
                            colors,
                            time,
                            activeIntroAnimation,
                            stripes.length,
                            wavePhase,
                            secondaryWavePhase,
                            reducedMotion ? 0 : speedUpState.shineProgress,
                            heightTop,
                            heightBottom,
                        )
                    }

                    if (grainPattern) {
                        drawGrain(context, grainPattern, size, colors)
                    }

                    if (isIntroComplete(time, introAnimation, stripes.length)) {
                        introAnimation = null
                    }
                }

                /**
                 * Animation loop callback — draws one frame and schedules the next.
                 *
                 * @param time - Current animation timestamp.
                 */
                const draw = (time: number) => {
                    animationFrame = null
                    drawFrame(time)
                    if (!reducedMotionQuery.matches) {
                        animationFrame = requestAnimationFrame(draw)
                    }
                }

                /**
                 * Start the animation loop if not already running and motion is allowed.
                 */
                const requestAnimation = () => {
                    if (animationFrame !== null || reducedMotionQuery.matches) return
                    animationFrame = requestAnimationFrame(draw)
                }

                if (!applyResize()) {
                    return
                }

                const introPlayedKey = "edgarcnp:shimmer-intro-played"

                const isIntroPlayed = () => {
                    try {
                        return sessionStorage.getItem(introPlayedKey) === "1"
                    } catch {
                        return false
                    }
                }

                const markIntroPlayed = () => {
                    try {
                        sessionStorage.setItem(introPlayedKey, "1")
                    } catch {
                        return
                    }
                }

                const startAfterResize = () => {
                    if (this.getAttribute("intro") !== "false" && !isIntroPlayed()) {
                        markIntroPlayed()
                        startIntro()
                    }
                }

                if (size.width === 0 || size.height === 0) {
                    const retryFrame = requestAnimationFrame(() => {
                        if (applyResize()) {
                            drawFrame(performance.now())
                            startAfterResize()
                        }
                    })

                    registerCleanup(() => cancelAnimationFrame(retryFrame))
                } else {
                    startAfterResize()
                }

                this.shimmerController = controller

                const resizeObserver = new ResizeObserver(scheduleResize)
                resizeObserver.observe(canvas)

                const scheduleColorRead = () => {
                    cancelResizeFrame()
                    resizeFrame = requestAnimationFrame((time) => {
                        if (readColors()) {
                            drawFrame(time)
                        }
                    })
                }

                const themeObserver = new MutationObserver(scheduleColorRead)
                themeObserver.observe(document.documentElement, { attributes: true })

                const onClick = () => {
                    controller.emphasize()
                }

                document.addEventListener("click", onClick)

                const handlePageReveal = (event: PageRevealEvent) => {
                    if (!event.viewTransition) return
                    controller.emphasize()
                }

                window.addEventListener("pagereveal", handlePageReveal)

                const updateMotionPreference = () => {
                    if (reducedMotionQuery.matches) {
                        introAnimation = null
                        speedUpAnimation = null
                        cancelAnimation()
                        drawFrame(performance.now())
                        return
                    }
                    lastFrameTime = null
                    requestAnimation()
                }

                colorSchemeQuery.addEventListener("change", scheduleColorRead)
                reducedMotionQuery.addEventListener("change", updateMotionPreference)

                const handleVisibilityChange = () => {
                    if (document.hidden) {
                        cancelAnimation()
                    } else {
                        lastFrameTime = null
                        requestAnimation()
                    }
                }

                document.addEventListener("visibilitychange", handleVisibilityChange)

                updateMotionPreference()

                registerCleanup(() => {
                    if (this.shimmerController === controller) {
                        this.shimmerController = null
                    }
                    cancelAnimation()
                    cancelResizeFrame()
                    resizeObserver.disconnect()
                    themeObserver.disconnect()
                    document.removeEventListener("click", onClick)
                    window.removeEventListener("pagereveal", handlePageReveal)
                    document.removeEventListener("visibilitychange", handleVisibilityChange)
                    colorSchemeQuery.removeEventListener("change", scheduleColorRead)
                    reducedMotionQuery.removeEventListener("change", updateMotionPreference)
                })

                this.initialized = true

            } catch (e) {
                console.error("[GradientShimmer] Init failed:", e instanceof Error ? e.message : e)
            }
        }

        if (typeof requestIdleCallback !== "undefined") {
            this.idleCallback = requestIdleCallback(() => {
                this.idleCallback = null
                init()
            })
        } else {
            this.idleCallback = window.setTimeout(() => {
                this.idleCallback = null
                init()
            }, 0)
        }
    }

    disconnectedCallback() {
        if (this.idleCallback !== null) {
            if (typeof cancelIdleCallback !== "undefined") {
                cancelIdleCallback(this.idleCallback)
            } else {
                window.clearTimeout(this.idleCallback)
            }
            this.idleCallback = null
        }

        for (const cleanup of this.cleanupFns) {
            cleanup()
        }
        this.cleanupFns = []

        this.shimmerController = null
        this.canvas?.remove()
        this.canvas = null
        this.initialized = false
    }
}

customElements.define("shimmer-background", ShimmerBackground)
