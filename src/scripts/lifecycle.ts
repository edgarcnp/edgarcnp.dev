interface BootRegistry {
    __bootFlags?: Set<string>
}

/** Runs setup once per window, even if the module re-executes after SPA navigation. */
export function oncePerWindow(key: string, setup: () => void): void {
    const registry = window as unknown as BootRegistry
    registry.__bootFlags ??= new Set()
    if (registry.__bootFlags.has(key)) return
    registry.__bootFlags.add(key)
    setup()
}

/** Runs the handler now (or on DOMContentLoaded) and again after every SPA navigation. */
export function onPageLoad(handler: () => void): void {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", handler, { once: true })
    } else {
        handler()
    }
    document.addEventListener("astro:page-load", handler)
}

/** Runs the handler before Astro swaps the page on SPA navigation. */
export function onBeforeSwap(handler: () => void): void {
    document.addEventListener("astro:before-swap", handler)
}
