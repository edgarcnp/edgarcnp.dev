import { animate } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { trackPointer } from "../pointer"
import { registry, scanned } from "../registry"
import { reducedQuery } from "../shared"

export const magnetic = (el: HTMLElement): void => {
    if (reducedQuery.matches || !window.matchMedia("(pointer: fine)").matches) return
    let xPosition = 0
    let yPosition = 0
    let xControls: AnimationPlaybackControls | null = null
    let yControls: AnimationPlaybackControls | null = null
    const applyTransform = (): void => {
        el.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0)`
    }
    const springTo = (targetX: number, targetY: number): void => {
        xControls?.stop()
        yControls?.stop()
        xControls = animate(0, targetX, {
            type: "spring",
            stiffness: 300,
            damping: 25,
            onUpdate: (value) => {
                if (!el.isConnected) return
                xPosition = value
                applyTransform()
            },
        })
        yControls = animate(0, targetY, {
            type: "spring",
            stiffness: 300,
            damping: 25,
            onUpdate: (value) => {
                if (!el.isConnected) return
                yPosition = value
                applyTransform()
            },
        })
    }
    const stopTracking = trackPointer(
        el,
        ({ dx, dy }) => {
            if ((dx * dx) + (dy * dy) <= 8100) {
                springTo(dx * 0.3, dy * 0.3)
            } else {
                springTo(0, 0)
            }
        },
        () => springTo(0, 0),
    )
    scanned.add(el)
    registry.push(() => {
        stopTracking()
        xControls?.stop()
        yControls?.stop()
    })
}
