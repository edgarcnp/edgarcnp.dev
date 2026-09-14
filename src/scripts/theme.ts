import { onPageLoad } from "./lifecycle"

const STORAGE_KEY = "theme"
const TRANSITION_CLASS = "theme-transition"

const media = window.matchMedia("(prefers-color-scheme: dark)")

const storedTheme = (): "light" | "dark" | null => {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === "light" || value === "dark") return value
    return null
}

const systemTheme = (): "light" | "dark" => (media.matches ? "dark" : "light")

const effectiveTheme = (): "light" | "dark" => storedTheme() ?? systemTheme()

const reducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches

const sync = (): void => {
    const stored = storedTheme()
    if (stored) {
        document.documentElement.dataset.theme = stored
    } else {
        delete document.documentElement.dataset.theme
    }
    const isDark = effectiveTheme() === "dark"
    const label = isDark ? "Switch to light theme" : "Switch to dark theme"
    document.querySelectorAll<HTMLButtonElement>(".theme-toggle").forEach((button) => {
        button.classList.toggle("is-dark", isDark)
        button.setAttribute("aria-pressed", String(isDark))
        button.setAttribute("aria-label", label)
        button.setAttribute("title", label)
    })
}

/** Crossfades the whole painted frame between the old and new theme. The DOM
 * mutation (`sync`) runs synchronously inside the browser's captured callback,
 * so the new frame already holds the target state; only the composited images
 * of the two frames are faded — no per-element property animation. The fade
 * timing lives in `styles/theme.css`, gated on the `theme-transition` class so
 * nothing is injected at runtime (the strict CSP forbids inline styles). */
const withThemeTransition = (): void => {
    if (reducedMotion() || !("startViewTransition" in document)) {
        sync()
        return
    }
    const root = document.documentElement
    root.classList.add(TRANSITION_CLASS)
    const transition = document.startViewTransition(() => sync())
    const clear = (): void => root.classList.remove(TRANSITION_CLASS)
    transition.finished.then(clear, clear)
}

onPageLoad(sync)

const bindToggles = (): void => {
    document.querySelectorAll<HTMLButtonElement>(".theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const next = effectiveTheme() === "dark" ? "light" : "dark"
            localStorage.setItem(STORAGE_KEY, next)
            withThemeTransition()
        })
    })

    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) withThemeTransition()
    })

    media.addEventListener("change", () => {
        if (storedTheme() === null) withThemeTransition()
    })
}

bindToggles()
