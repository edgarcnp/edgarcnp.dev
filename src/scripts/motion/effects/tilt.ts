import { animate, motionValue } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { trackPointer } from "../pointer"
import { registry, scanned } from "../registry"
import { reducedQuery } from "../shared"

export const tilt = (el: HTMLElement): void => {
    if (reducedQuery.matches || !window.matchMedia("(pointer: fine)").matches) return
    let rotXControls: AnimationPlaybackControls | null = null
    let rotYControls: AnimationPlaybackControls | null = null
    const rotX = motionValue(0)
    const rotY = motionValue(0)
    const applyTransform = (): void => {
        el.style.transform = `perspective(600px) rotateX(${rotX.get()}deg) rotateY(${rotY.get()}deg)`
    }
    const springTo = (targetRotX: number, targetRotY: number): void => {
        rotXControls?.stop()
        rotYControls?.stop()
        rotXControls = animate(rotX, targetRotX, {
            type: "spring",
            stiffness: 300,
            damping: 25,
            onUpdate: () => {
                if (!el.isConnected) return
                applyTransform()
            },
        })
        rotYControls = animate(rotY, targetRotY, {
            type: "spring",
            stiffness: 300,
            damping: 25,
            onUpdate: () => {
                if (!el.isConnected) return
                applyTransform()
            },
        })
    }
    const stopTracking = trackPointer(
        el,
        ({ dx, dy, rect }) => {
            springTo((-dy / (rect.height / 2)) * 8, (dx / (rect.width / 2)) * 8)
        },
        () => springTo(0, 0),
    )
    scanned.add(el)
    registry.push(() => {
        stopTracking()
        rotXControls?.stop()
        rotYControls?.stop()
    })
}
