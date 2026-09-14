import { animate } from "motion"
import { marqueeControls, registry, scanned } from "../registry"

export const marquee = (el: HTMLElement): void => {
    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return
    const duration = parseFloat(el.dataset.duration ?? "") || 20
    scanned.add(el)
    for (const child of children) {
        scanned.add(child)
        const controls = animate(child, { x: "-50%" }, { duration, ease: "linear", repeat: Infinity })
        marqueeControls.push(controls)
        registry.push(() => controls.stop())
    }
}
