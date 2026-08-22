// External-link warning overlay.
//
// Direct port of the Motion "warp overlay" example. When an external link is
// activated, the page content does a brief 3D warp pulse (scale/skew/rotate
// about its top edge) while a translucent warning dialog fades in over it.
// The user chooses to continue (opens the link in a new tab) or cancel.

import { animate, initPrefersReducedMotion, motionValue, prefersReducedMotion } from "motion"
import type { AnimationPlaybackControls } from "motion"

const CONTENT_SELECTOR = "#content-warp"
const OVERLAY_ID = "external-warn"

let warpControls: AnimationPlaybackControls[] = []
let warpOrigin = "50% 0%"
let overlayControls: AnimationPlaybackControls[] = []
let breatheUnsub: (() => void) | null = null
let overlay: HTMLElement | null = null
let returnFocusTo: HTMLElement | null = null
let mounted = false

initPrefersReducedMotion()

const isExternal = (href: string): boolean => {
    try {
        const url = new URL(href, window.location.href)
        const isHttp = url.protocol === "http:" || url.protocol === "https:"
        return isHttp && url.origin !== window.location.origin
    } catch {
        return false
    }
}

const escapeHtml = (value: string): string =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")

const applyWarp = (value: number): void => {
    const target = document.querySelector<HTMLElement>(CONTENT_SELECTOR)
    if (!target) return
    const intensity = 0.1
    const rotateX = -5 * value
    const skewY = -1.5 * value
    const scaleY = 1 + (value * intensity)
    const scaleX = 1 - (value * intensity * 0.6)
    target.style.transformOrigin = warpOrigin
    target.style.transform = `perspective(500px) rotateX(${rotateX}deg) skewY(${skewY}deg) scaleY(${scaleY}) scaleX(${scaleX})`
}

const stopWarp = (): void => {
    for (const controls of warpControls) controls.stop()
    warpControls = []
    const target = document.querySelector<HTMLElement>(CONTENT_SELECTOR)
    if (target) {
        target.style.transform = ""
        target.style.transformOrigin = ""
    }
}

const stopOverlayAnimations = (): void => {
    for (const controls of overlayControls) controls.stop()
    overlayControls = []
    breatheUnsub?.()
    breatheUnsub = null
}

const runWarp = (): void => {
    if (prefersReducedMotion.current) return
    warpControls.push(
        animate(0, 1, {
            duration: 0.3,
            ease: [0.65, 0, 0.35, 1],
            onUpdate: applyWarp,
            onComplete: () => {
                warpControls.push(
                    animate(1, 0, {
                        duration: 1.5,
                        ease: [0.22, 1, 0.36, 1],
                        onUpdate: applyWarp,
                    }),
                )
            },
        }),
    )
}

const buildOverlay = (href: string): HTMLElement => {
    let host = ""
    try {
        host = new URL(href, window.location.href).hostname
    } catch {
        /* noop */
    }
    const root = document.createElement("div")
    root.id = OVERLAY_ID
    root.className = "external-warn"
    root.setAttribute("role", "dialog")
    root.setAttribute("aria-modal", "true")
    root.setAttribute("aria-labelledby", `${OVERLAY_ID}-title`)
    root.innerHTML = `
      <div class="external-warn__gradient" aria-hidden="true">
        <div class="external-warn__burst"></div>
        <div class="external-warn__orb external-warn__orb--tl"></div>
        <div class="external-warn__orb external-warn__orb--br"></div>
      </div>
      <div class="external-warn__content">
        <div class="external-warn__card">
          <p class="external-warn__eyebrow">You're leaving this site</p>
          <h2 class="external-warn__title h3" id="${OVERLAY_ID}-title">Redirect to external link?</h2>
          <p class="external-warn__message">
            This will open <span class="external-warn__host">${escapeHtml(host)}</span> in a new tab.
            Continue only if you trust the destination site.
          </p>
          <div class="external-warn__actions">
            <a class="btn-primary" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Continue</a>
            <button type="button" class="btn-secondary" data-external-warn="cancel">Cancel</button>
          </div>
        </div>
      </div>
    `
    return root
}

const closeOverlay = (): void => {
    if (!overlay) return
    const node = overlay
    overlay = null
    stopWarp()
    stopOverlayAnimations()
    // Exit mirrors the source's `exit` variants (via Motion): content and card
    // warp/fade out over 350ms, the gradient pieces shrink/fade over 500ms.
    if (!prefersReducedMotion.current) {
        const content = node.querySelector<HTMLElement>(".external-warn__content")
        const burst = node.querySelector<HTMLElement>(".external-warn__burst")
        const card = node.querySelector<HTMLElement>(".external-warn__card")
        if (content) {
            overlayControls.push(
                animate(content, { opacity: 0 }, { duration: 0.35, ease: [0.59, 0, 0.35, 1] }),
            )
        }
        if (burst) {
            overlayControls.push(
                animate(
                    burst,
                    { scale: 0, opacity: 1, backgroundColor: "rgb(233, 167, 160)" },
                    { duration: 0.5 },
                ),
            )
        }
        node.querySelectorAll<HTMLElement>(".external-warn__orb").forEach((orb) => {
            overlayControls.push(animate(orb, { opacity: 0 }, { duration: 0.5 }))
        })
        if (card) {
            overlayControls.push(
                animate(
                    card,
                    {
                        rotateX: -5,
                        skewY: -1.5,
                        scaleY: 2,
                        scaleX: 0.4,
                        y: 100,
                        transformPerspective: 1000,
                    },
                    { duration: 0.35, ease: [0.59, 0, 0.35, 1] },
                ),
            )
        }
    }
    const exitMs = prefersReducedMotion.current ? 0 : 500
    window.setTimeout(() => node.remove(), exitMs)
    document.body.style.overflow = ""
    const focus = returnFocusTo
    returnFocusTo = null
    if (focus?.isConnected) focus.focus()
}

const onOverlayKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
        event.preventDefault()
        closeOverlay()
        return
    }
    if (event.key !== "Tab") return
    const focusables = overlay?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
    if (!focusables || focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
    }
}

const showOverlay = (href: string): void => {
    if (overlay) overlay.remove()
    const root = buildOverlay(href)
    overlay = root
    document.body.appendChild(root)

    // Geometry mirrors the OG source verbatim: the expanding-circle radius is
    // width/3 and each gradient-circle is width*2. The source measures a fixed
    // 375px frame, so its blurs (100px / 15px) are proportionally large; to keep
    // that frosted ratio on every layout we scale the blur with the viewport
    // width the same axis the sizes use (width/375) while keeping sizes exact.
    const width = root.clientWidth || window.innerWidth
    const height = root.clientHeight || window.innerHeight
    const blurScale = width / 375

    const content = root.querySelector<HTMLElement>(".external-warn__content")
    const burst = root.querySelector<HTMLElement>(".external-warn__burst")
    const orbTL = root.querySelector<HTMLElement>(".external-warn__orb--tl")
    const orbBR = root.querySelector<HTMLElement>(".external-warn__orb--br")

    const burstRadius = width / 3
    if (burst) {
        burst.style.width = burst.style.height = `${burstRadius}px`
        burst.style.left = `calc(50% - ${burstRadius / 2}px)`
        burst.style.bottom = "0"
        burst.style.transformOrigin = "50% 100%"
        burst.style.filter = `blur(${15 * blurScale}px)`
    }

    const orbSize = width * 2
    if (orbTL) {
        orbTL.style.width = orbTL.style.height = `${orbSize}px`
        orbTL.style.top = `${-width}px`
        orbTL.style.left = `${-width}px`
        orbTL.style.filter = `blur(${100 * blurScale}px)`
    }
    if (orbBR) {
        orbBR.style.width = orbBR.style.height = `${orbSize}px`
        orbBR.style.top = `${height - width}px`
        orbBR.style.left = "0"
        orbBR.style.filter = `blur(${100 * blurScale}px)`
    }

    const card = root.querySelector<HTMLElement>(".external-warn__card")
    if (card) card.style.transformOrigin = "50% 0%"

    if (prefersReducedMotion.current) return

    // Entry mirrors the source, driven by Motion: content fades with the 0.35
    // bezier, the expanding circle grows (scale/bg on the default ease, opacity
    // easeInOut), the orbs fade while their scale is driven by the breathing
    // motion value, and the card warps in with a spring on y.
    if (content) {
        overlayControls.push(
            animate(content, { opacity: [0, 1] }, { duration: 0.35, ease: [0.59, 0, 0.35, 1] }),
        )
    }

    if (burst) {
        overlayControls.push(
            animate(
                burst,
                {
                    scale: [0, 10],
                    opacity: [1, 0.2],
                    backgroundColor: ["rgb(233, 167, 160)", "rgb(246, 63, 42)"],
                },
                { duration: 0.75, opacity: { duration: 0.75, ease: "easeInOut" } },
            ),
        )
    }

    const orbs = [orbTL, orbBR].filter((orb): orb is HTMLElement => orb !== null)
    if (orbs.length > 0) {
        for (const orb of orbs) {
            orb.style.transform = "scale(0)"
            overlayControls.push(animate(orb, { opacity: [0, 0.25] }, { duration: 0.75 }))
        }
        const breatheValue = motionValue(0)
        breatheUnsub = breatheValue.on("change", (value) => {
            for (const orb of orbs) orb.style.transform = `scale(${value})`
        })
        overlayControls.push(
            animate(breatheValue, 1, {
                duration: 0.5,
                delay: 0.35,
                ease: [0, 0.55, 0.45, 1],
                onComplete: () => {
                    overlayControls.push(
                        animate(breatheValue, [null, 0.7, 1], {
                            duration: 15,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                        }),
                    )
                },
            }),
        )
    }

    if (card) {
        card.style.willChange = "transform"
        card.style.transform
            = "perspective(1000px) rotateX(-5deg) skewY(-1.5deg) scaleY(2) scaleX(0.4) translateY(100px)"
        overlayControls.push(
            animate(
                card,
                {
                    rotateX: [-5, 0],
                    skewY: [-1.5, 0],
                    scaleY: [2, 1],
                    scaleX: [0.4, 1],
                    y: [100, 0],
                    transformPerspective: 1000,
                },
                {
                    duration: 0.35,
                    ease: [0.59, 0, 0.35, 1],
                    y: { type: "spring", visualDuration: 0.7, bounce: 0.2 },
                },
            ),
        )
    }

    const continueLink = root.querySelector<HTMLAnchorElement>(".external-warn__actions a")
    const cancelButton = root.querySelector<HTMLButtonElement>("[data-external-warn='cancel']")

    cancelButton?.addEventListener("click", (event) => {
        event.preventDefault()
        closeOverlay()
    })
    root.addEventListener("click", (event) => {
        if (!(event.target as HTMLElement).closest(".external-warn__card")) closeOverlay()
    })
    continueLink?.addEventListener("click", (event) => {
        event.stopPropagation()
        closeOverlay()
    })
    root.addEventListener("keydown", onOverlayKeydown)

    continueLink?.focus()
}

const onDocumentClick = (event: MouseEvent): void => {
    if (overlay?.contains(event.target as Node)) return
    const anchor = (event.target as HTMLElement | null)?.closest("a")
    if (!anchor) return
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const href = anchor.getAttribute("href")
    if (!href || !isExternal(href)) return

    event.preventDefault()
    returnFocusTo = anchor
    // Capture the pivot BEFORE the scroll-locking `overflow: hidden`, so the
    // measurement isn't affected by any browser scroll adjustment it triggers.
    // The origin is pinned to the viewport top so warp intensity is identical
    // no matter how far the page is scrolled (browser-agnostic).
    const target = document.querySelector<HTMLElement>(CONTENT_SELECTOR)
    if (target) warpOrigin = `50% ${-target.getBoundingClientRect().top}px`
    document.body.style.overflow = "hidden"
    runWarp()
    showOverlay(href)
}

const boot = (): void => {
    if (mounted) return
    mounted = true
    document.addEventListener("click", onDocumentClick)
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
    boot()
}
