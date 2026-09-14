import { animate } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { registry, scanned } from "../registry"
import { reducedQuery } from "../shared"

export const tap = (el: HTMLElement): void => {
    if (reducedQuery.matches) return
    let controls: AnimationPlaybackControls | null = null
    const press = (): void => {
        controls?.stop()
        controls = animate(el, { scale: 0.97 }, { type: "spring", stiffness: 300, damping: 25 })
    }
    const release = (): void => {
        controls?.stop()
        controls = animate(el, { scale: 1 }, { type: "spring", stiffness: 300, damping: 25 })
    }
    el.addEventListener("pointerdown", press)
    window.addEventListener("pointerup", release)
    el.addEventListener("pointerleave", release)
    scanned.add(el)
    registry.push(() => {
        el.removeEventListener("pointerdown", press)
        window.removeEventListener("pointerup", release)
        el.removeEventListener("pointerleave", release)
        controls?.stop()
    })
}
