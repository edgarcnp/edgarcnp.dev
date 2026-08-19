/**
 * Ambient background — soft, slow-drifting color orbs behind all content.
 *
 * Replaces the canvas shimmer system. A single `<div class="ambient-bg">` is
 * managed entirely from this module: adopted if already present in the DOM,
 * otherwise created as the first child of `<body>`.
 *
 * - Colors are read at runtime from the theme tokens on `:root` (`--bg`,
 *   `--accent`, `--ink`, `--accent-soft`); nothing is hardcoded.
 * - Theme changes (`data-theme` attribute) re-read the tokens and crossfade
 *   each orb's color via motion.
 * - Reduced motion renders one static frame and runs no animation loop; live
 *   preference changes pause/resume accordingly.
 * - The animation loop pauses while the tab is hidden.
 *
 * Astro's ClientRouter swaps `document.body`, destroying the element on every
 * navigation; `astro:page-load` recreates it. The module itself re-executes on
 * each page's bundle, so a `window` guard keeps listeners/singleton intact.
 */
import {
    animate,
    initPrefersReducedMotion,
    prefersReducedMotion,
    type AnimationPlaybackControls,
} from "motion"

const ELEMENT_CLASS = "ambient-bg"
const ORB_CLASS = "ambient-orb"
const COLOR_PROP = "--orb-color-raw"
const ALPHA_PROP = "--orb-alpha"

declare global {
    interface Window {
        __ambientBgInstalled?: boolean
    }
}

/** Theme tokens consumed by the background; read from `:root` at runtime. */
const TOKENS = ["--bg", "--accent", "--ink", "--accent-soft"] as const
type Token = (typeof TOKENS)[number]

/**
 * Per-orb layout: base translate (in % of the orb's own size, relative to a
 * viewport-centered 60vmax circle), drift applied by the animation, scale
 * range, alpha for the radial gradient, and drift duration/delay.
 */
interface OrbSpec {
    token: Token
    alpha: number
    x: number
    y: number
    driftX: number
    driftY: number
    scale: [number, number]
    duration: number
    delay: number
}

const ORB_SPECS: readonly OrbSpec[] = [
    {
        token: "--accent",
        alpha: 32,
        x: -28,
        y: -18,
        driftX: -10,
        driftY: -14,
        scale: [1, 1.14],
        duration: 78,
        delay: 0,
    },
    {
        token: "--accent-soft",
        alpha: 42,
        x: -62,
        y: -40,
        driftX: 12,
        driftY: 8,
        scale: [1, 1.08],
        duration: 64,
        delay: 6,
    },
    {
        token: "--ink",
        alpha: 15,
        x: -44,
        y: -62,
        driftX: -8,
        driftY: 12,
        scale: [1, 1.18],
        duration: 88,
        delay: 12,
    },
]

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

/** Resolves a token value (hex, rgb, color-mix, ...) to a plain color for reliable interpolation. */
const colorProbe = document.createElement("span")
const resolveColor = (value: string): string => {
    colorProbe.style.color = value
    return getComputedStyle(colorProbe).color
}

const readThemeTokens = (): Partial<Record<Token, string>> => {
    const styles = getComputedStyle(document.documentElement)
    const tokens: Partial<Record<Token, string>> = {}
    for (const token of TOKENS) {
        const value = styles.getPropertyValue(token).trim()
        if (value) tokens[token] = resolveColor(value)
    }
    return tokens
}

const reducedMotion = (): boolean => prefersReducedMotion.current === true

const isLightTheme = (): boolean => {
    const explicit = document.documentElement.dataset.theme
    if (explicit) return explicit === "light"
    return !window.matchMedia("(prefers-color-scheme: dark)").matches
}

const orbAlpha = (base: number): number => (isLightTheme() ? Math.min(Math.round(base * 1.6), 60) : base)

const orbCount = (): number => {
    const narrow = window.matchMedia("(max-width: 640px)").matches
    const highDpr = window.devicePixelRatio >= 2
    return narrow || highDpr ? 2 : 3
}

interface OrbInstance {
    node: HTMLElement
    spec: OrbSpec
}

interface AmbientState {
    container: HTMLElement
    orbs: OrbInstance[]
}

let ambient: AmbientState | null = null
let controls: AnimationPlaybackControls[] = []
let themeObserver: MutationObserver | null = null
let visibilityHandler: (() => void) | null = null
let reducedMotionHandler: (() => void) | null = null

const getOrCreateElement = (): HTMLElement => {
    const existing = document.querySelector<HTMLElement>(`.${ELEMENT_CLASS}`)
    if (existing) {
        existing.replaceChildren()
        return existing
    }
    const element = document.createElement("div")
    element.className = ELEMENT_CLASS
    element.setAttribute("aria-hidden", "true")
    document.body.insertBefore(element, document.body.firstChild)
    return element
}

const buildOrbs = (container: HTMLElement, tokens: Partial<Record<Token, string>>): OrbInstance[] => {
    return ORB_SPECS.slice(0, orbCount()).map((spec) => {
        const node = document.createElement("div")
        node.className = ORB_CLASS
        const color = tokens[spec.token]
        if (color) node.style.setProperty(COLOR_PROP, color)
        node.style.setProperty(ALPHA_PROP, `${orbAlpha(spec.alpha)}%`)
        container.appendChild(node)
        return { node, spec }
    })
}

const staticTransform = (spec: OrbSpec): string =>
    `translate(${spec.x}%, ${spec.y}%) scale(${spec.scale[0]})`

const applyStaticFrame = (orbs: OrbInstance[]): void => {
    for (const { node, spec } of orbs) {
        node.style.transform = staticTransform(spec)
    }
}

const startOrbAnimations = (orbs: OrbInstance[]): AnimationPlaybackControls[] => {
    return orbs.map(({ node, spec }) => {
        return animate(
            node,
            {
                transform: [
                    staticTransform(spec),
                    `translate(${spec.x + spec.driftX}%, ${spec.y + spec.driftY}%) scale(${spec.scale[1]})`,
                ],
            },
            {
                duration: spec.duration,
                delay: spec.delay,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
            },
        )
    })
}

const stopAllAnimations = (): void => {
    for (const control of controls) control.stop()
    controls = []
}

const crossfadeOrbColors = (): void => {
    if (!ambient) return
    const tokens = readThemeTokens()
    for (const { node, spec } of ambient.orbs) {
        node.style.setProperty(ALPHA_PROP, `${orbAlpha(spec.alpha)}%`)
        const next = tokens[spec.token]
        if (!next) continue
        const current = node.style.getPropertyValue(COLOR_PROP)
        if (current === next) continue
        if (reducedMotion()) {
            node.style.setProperty(COLOR_PROP, next)
            continue
        }
        if (!current) {
            node.style.setProperty(COLOR_PROP, next)
            continue
        }
        animate(node, { [COLOR_PROP]: [current, next] }, { duration: 0.9, ease: "easeInOut" })
    }
}

const handleVisibilityChange = (): void => {
    if (!ambient) return
    if (document.visibilityState === "hidden") {
        for (const control of controls) control.pause()
    } else {
        for (const control of controls) control.play()
    }
}

const handleReducedMotionChange = (): void => {
    if (!ambient) return
    if (reducedMotion()) {
        stopAllAnimations()
        applyStaticFrame(ambient.orbs)
    } else {
        controls = startOrbAnimations(ambient.orbs)
    }
}

const teardown = (): void => {
    stopAllAnimations()
    themeObserver?.disconnect()
    themeObserver = null
    if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler)
        visibilityHandler = null
    }
    if (reducedMotionHandler) {
        reducedMotionQuery.removeEventListener("change", reducedMotionHandler)
        reducedMotionHandler = null
    }
    ambient = null
}

const setup = (): void => {
    teardown()
    const container = getOrCreateElement()
    const orbs = buildOrbs(container, readThemeTokens())
    ambient = { container, orbs }

    if (reducedMotion()) {
        applyStaticFrame(orbs)
    } else {
        controls = startOrbAnimations(orbs)
    }

    themeObserver = new MutationObserver(crossfadeOrbColors)
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    })

    visibilityHandler = handleVisibilityChange
    document.addEventListener("visibilitychange", visibilityHandler)

    reducedMotionHandler = handleReducedMotionChange
    reducedMotionQuery.addEventListener("change", reducedMotionHandler)
}

/**
 * Boots the ambient background. Self-invoked once per window; safe to call
 * again after Astro SPA navigations re-execute this module.
 */
export const initAmbientBackground = (): void => {
    if (window.__ambientBgInstalled) return
    window.__ambientBgInstalled = true
    document.addEventListener("astro:page-load", () => {
        if (!document.querySelector(`.${ELEMENT_CLASS}`)) setup()
    })
    setup()
}

initPrefersReducedMotion()
initAmbientBackground()
