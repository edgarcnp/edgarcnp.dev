/** Runs the handler once now (before the window `load` event) and again after
 * every SPA navigation. Bundled module scripts execute exactly once, so no
 * per-key guard is needed. Astro dispatches the initial `astro:page-load` on the
 * window `load` event, which would re-run the handler once on first paint — so
 * that first event is consumed here, keeping the handler to once per page. */
export function onPageLoad(handler: () => void): void {
    handler()
    let primed = document.readyState === "complete"
    document.addEventListener("astro:page-load", () => {
        if (primed) {
            handler()
            return
        }
        primed = true
    })
}

/** Runs the handler before Astro swaps the page on SPA navigation. */
export function onBeforeSwap(handler: () => void): void {
    document.addEventListener("astro:before-swap", handler)
}
