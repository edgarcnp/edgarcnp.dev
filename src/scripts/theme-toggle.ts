const windowRef = window as unknown as { __themeToggleBound?: boolean }

const STORAGE_KEY = "theme"
const DURATION_MS = 600
const EASING = "cubic-bezier(0.65, 0, 0.35, 1)"

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
 * of the two frames are faded — no per-element property animation. */
const withThemeTransition = (): void => {
    const syncNow = (): void => sync()
    if (reducedMotion() || !("startViewTransition" in document)) {
        syncNow()
        return
    }
    const style = document.createElement("style")
    style.textContent = `
        ::view-transition-old(root),
        ::view-transition-new(root) {
            animation-duration: ${DURATION_MS}ms;
            animation-timing-function: ${EASING};
        }
    `
    document.head.appendChild(style)
    const transition = document.startViewTransition(syncNow)
    transition.finished.then(
        () => style.remove(),
        () => style.remove(),
    )
}

document.addEventListener("astro:page-load", sync)

if (!windowRef.__themeToggleBound) {
    windowRef.__themeToggleBound = true
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

sync()
