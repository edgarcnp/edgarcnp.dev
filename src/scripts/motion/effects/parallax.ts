import { scroll } from "motion"
import { registry, scanned } from "../registry"

export const parallax = (el: HTMLElement): void => {
    const speed = parseFloat(el.dataset.speed ?? "") || 0.15
    scanned.add(el)
    const container = document.getElementById("content-warp") ?? undefined
    registry.push(
        scroll(
            (progress: number) => {
                if (!el.isConnected) return
                el.style.transform = `translateY(${-30 * speed * progress}px)`
            },
            { target: el, offset: ["start end", "end start"], container },
        ),
    )
}
