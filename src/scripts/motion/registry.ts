import type { AnimationPlaybackControls } from "motion"

type Stop = () => void

export const registry: Stop[] = []
export const scanned = new Set<HTMLElement>()
export const counterFinals = new WeakMap<HTMLElement, string>()
export const marqueeControls: AnimationPlaybackControls[] = []

export const stopAll = (): void => {
    for (const stop of registry) stop()
    registry.length = 0
}

export const teardown = (): void => {
    stopAll()
    scanned.clear()
    marqueeControls.length = 0
    for (const el of document.querySelectorAll<HTMLElement>("[data-roll-enable]")) {
        delete el.dataset.rollEnable
    }
}

export const snapFinal = (): void => {
    for (const el of scanned) {
        el.style.opacity = "1"
        el.style.transform = "none"
        const final = counterFinals.get(el)
        if (final !== undefined) el.textContent = final
    }
}
