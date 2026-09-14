import { animate, easeOut, inView } from "motion"
import { counterFinals, registry, scanned } from "../registry"
import { formatFrom } from "../shared"

const viewport = { margin: "-40px" } as const

export const counter = (el: HTMLElement): void => {
    const source = el.dataset.to ?? el.textContent
    const target = parseFloat(source.replace(/,/g, ""))
    if (Number.isNaN(target)) return
    const duration = parseFloat(el.dataset.duration ?? "") || 1.2
    const format = formatFrom(source)
    const final = format(target)
    counterFinals.set(el, final)
    scanned.add(el)
    registry.push(
        inView(
            el,
            () => {
                const controls = animate(0, target, {
                    duration,
                    ease: easeOut,
                    onUpdate: (value) => {
                        if (!el.isConnected) {
                            controls.stop()
                            return
                        }
                        el.textContent = format(value)
                    },
                })
                registry.push(() => controls.stop())
            },
            viewport,
        ),
    )
}
