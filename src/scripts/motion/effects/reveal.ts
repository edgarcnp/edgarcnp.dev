import { animate, easeOut, prefersReducedMotion, stagger } from "motion"
import { registry, scanned } from "../registry"

export const reveal = (root: HTMLElement): void => {
    if (prefersReducedMotion.current === true) return
    const items = root.querySelectorAll<HTMLElement>("[data-reveal]")
    for (const [index, el] of Array.from(items).entries()) {
        const controls = animate(
            el,
            { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0)"] },
            { duration: 0.5, ease: easeOut, delay: 0.2 + stagger(0.08)(index, items.length) },
        )
        registry.push(() => controls.stop())
        scanned.add(el)
    }
}
