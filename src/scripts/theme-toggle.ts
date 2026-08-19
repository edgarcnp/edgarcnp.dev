const windowRef = window as unknown as { __themeToggleBound?: boolean }

const STORAGE_KEY = "theme"

const media = window.matchMedia("(prefers-color-scheme: dark)")

const storedTheme = (): "light" | "dark" | null => {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === "light" || value === "dark") return value
    return null
}

const systemTheme = (): "light" | "dark" => (media.matches ? "dark" : "light")

const effectiveTheme = (): "light" | "dark" => storedTheme() ?? systemTheme()

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

document.addEventListener("astro:page-load", sync)

if (!windowRef.__themeToggleBound) {
    windowRef.__themeToggleBound = true
    document.querySelectorAll<HTMLButtonElement>(".theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const next = effectiveTheme() === "dark" ? "light" : "dark"
            localStorage.setItem(STORAGE_KEY, next)
            sync()
        })
    })

    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) sync()
    })

    media.addEventListener("change", () => {
        if (storedTheme() === null) sync()
    })
}

sync()
