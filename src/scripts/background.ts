/**
 * Keep a single shared `<shimmer-background>` instance for the whole SPA.
 *
 * Astro's ClientRouter only swaps `document.body`, so an element attached directly
 * under `<html>` is never removed, moved, or re-created during navigations — the
 * canvas keeps animating with zero lifecycle churn (true shared instance, unlike
 * `transition:persist`, which moves each page's own element).
 *
 * On the first load, the SSR element from the Layout is hoisted up to `<html>`.
 * Before every swap, shimmer elements are stripped from both the old body and the
 * incoming document so the swap never touches the hoisted instance.
 */
const ensureSingleInstance = () => {
    const host = document.documentElement
    if (host.querySelector(":scope > shimmer-background")) return

    const existing = document.body.querySelector("shimmer-background")
    if (existing) {
        host.appendChild(existing)
        return
    }

    const element = document.createElement("shimmer-background")
    element.setAttribute("background", "")
    element.setAttribute("intro", "")
    element.className = "shimmer-canvas"
    host.appendChild(element)
}

const stripFrom = (root: ParentNode) => {
    root.querySelectorAll("shimmer-background").forEach((element) => element.remove())
}

declare global {
    interface Window {
        __shimmerSpaInstalled?: boolean
    }
}

if (!window.__shimmerSpaInstalled) {
    window.__shimmerSpaInstalled = true

    document.addEventListener("astro:before-swap", (event) => {
        const swapEvent = event as Event & { newDocument: Document }
        stripFrom(document.body)
        stripFrom(swapEvent.newDocument)
    })

    document.addEventListener("astro:page-load", ensureSingleInstance)
}

ensureSingleInstance()
