/* global window, document, localStorage */
(function () {
    if (window.__themeInitDone) return
    window.__themeInitDone = true

    var stored
    try {
        stored = localStorage.getItem("theme")
    } catch (_) {
        stored = null
    }

    var chosen = stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"

    document.documentElement.dataset.theme = chosen
    document.documentElement.style.colorScheme = chosen
})()
