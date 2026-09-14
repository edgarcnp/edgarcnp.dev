import { animate, prefersReducedMotion } from "motion"
import { registry, scanned } from "../registry"
import { applyRoll, enableRoll, playRoll } from "./roll"
import { tilt } from "./tilt"

/** Ambient animation for the error-page status code: roll-in, breathing glow, tilt. */
export const errorCode = (root: HTMLElement): void => {
    if (prefersReducedMotion.current === true) return
    const codeEl = root.matches(".error-page__code")
        ? root
        : root.querySelector<HTMLElement>(".error-page__code")
    if (!codeEl) return
    applyRoll(codeEl)
    const rollControls = playRoll(codeEl, false, 0.45)
    for (const c of rollControls) registry.push(() => c.stop())
    scanned.add(codeEl)
    for (const descendant of codeEl.querySelectorAll<HTMLElement>(".roll, .roll__char, .roll__face")) {
        scanned.add(descendant)
    }
    enableRoll(codeEl)
    const glowControls = animate(
        codeEl,
        { filter: ["brightness(1)", "brightness(1.12)", "brightness(1)"] },
        { duration: 5, ease: "easeInOut", repeat: Infinity },
    )
    registry.push(() => glowControls.stop())
    scanned.add(codeEl)
    tilt(codeEl)
}
