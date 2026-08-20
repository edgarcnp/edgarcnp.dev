/**
 * Ambient background — three soft color orbs arranged in Borromean rings,
 * centered on the viewport. Static arrangement (no drift), so the visual is
 * identical under reduced motion.
 *
 * - Colors are read at runtime from the theme tokens on `:root` (`--accent`,
 *   `--accent-soft`, `--ink`); nothing is hardcoded.
 * - Theme changes (`data-theme` attribute) re-read the tokens and crossfade
 *   each orb's color via motion.
 *
 * Astro's ClientRouter swaps `document.body`; the container carries
 * `transition:persist` so it (and its orbs) survive navigation. When a page
 * arrives without one (e.g. a fresh load), `astro:page-load` rebuilds it.
 */
import { animate, initPrefersReducedMotion, prefersReducedMotion } from "motion"

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
 * Per-orb layout. Each orb is a 60vmax circle whose top-left corner sits at
 * the viewport center (`left: 50%; top: 50%`); `x`/`y` are translates in %
 * of the orb's own size, so the whole composition scales with `vmax`.
 *
 * The three centers form an equilateral triangle (side ≈ 0.75 × orb size)
 * centered on the viewport — the Borromean ring arrangement, where every
 * pair of rings overlaps in a lens but no pair is itself linked.
 */
interface OrbSpec {
    token: Token
    alpha: number
    x: number
    y: number
}

const ORB_SPECS: readonly OrbSpec[] = [
    { token: "--accent", alpha: 32, x: -50, y: -78.9 },
    { token: "--accent", alpha: 32, x: -75, y: -35.6 },
    { token: "--accent", alpha: 32, x: -25, y: -35.6 },
]

/** Resolves a token value (hex, rgb, color-mix, ...) to a plain color for reliable interpolation. */
const PROBE_ID = "__ambient-probe"
const resolveColor = (value: string): string => {
    let probe = document.getElementById(PROBE_ID)
    if (!probe) {
        probe = document.createElement("span")
        probe.id = PROBE_ID
        probe.setAttribute("aria-hidden", "true")
        probe.style.cssText = "position:absolute;left:-9999px;width:0;height:0;opacity:0"
        document.documentElement.appendChild(probe)
    }
    probe.style.color = value
    return getComputedStyle(probe).color
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

const orbAlpha = (base: number): number => (isLightTheme() ? Math.min(Math.round(base * 2), 72) : base)

interface OrbInstance {
    node: HTMLElement
    spec: OrbSpec
}

interface AmbientState {
    container: HTMLElement
    orbs: OrbInstance[]
}

let ambient: AmbientState | null = null
let themeObserver: MutationObserver | null = null

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
    return ORB_SPECS.map((spec) => {
        const node = document.createElement("div")
        node.className = ORB_CLASS
        const color = tokens[spec.token]
        if (color) node.style.setProperty(COLOR_PROP, color)
        node.style.setProperty(ALPHA_PROP, `${orbAlpha(spec.alpha)}%`)
        node.style.transform = `translate(${spec.x}%, ${spec.y}%)`
        container.appendChild(node)
        return { node, spec }
    })
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

const teardown = (): void => {
    themeObserver?.disconnect()
    themeObserver = null
    ambient = null
}

const setup = (): void => {
    // If the container already has orbs (e.g. persisted across navigation), skip
    const container = document.querySelector<HTMLElement>(`.${ELEMENT_CLASS}`)
    if (container?.querySelector(`.${ORB_CLASS}`)) return

    teardown()
    const el = getOrCreateElement()
    const orbs = buildOrbs(el, readThemeTokens())
    ambient = { container: el, orbs }

    themeObserver = new MutationObserver(crossfadeOrbColors)
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    })
}

/**
 * Boots the ambient background. Self-invoked once per window; safe to call
 * again after Astro SPA navigations re-execute this module.
 */
const initAmbientBackground = (): void => {
    if (window.__ambientBgInstalled) return
    window.__ambientBgInstalled = true
    document.addEventListener("astro:page-load", () => {
        setup()
    })
    setup()
}

initPrefersReducedMotion()
initAmbientBackground()
