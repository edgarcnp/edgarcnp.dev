import { initPrefersReducedMotion } from "motion"
import { onBeforeSwap, onPageLoad } from "../lifecycle"
import { marqueeControls, snapFinal, teardown } from "./registry"
import { formatFrom, isReduced, reducedQuery } from "./shared"
import { counter } from "./effects/counter"
import { enableRoll } from "./effects/roll"
import { errorCode } from "./effects/error-code"
import { magnetic } from "./effects/magnetic"
import { marquee } from "./effects/marquee"
import { parallax } from "./effects/parallax"
import { reveal } from "./effects/reveal"
import { roll } from "./effects/roll"
import { tap } from "./effects/tap"
import { tilt } from "./effects/tilt"

initPrefersReducedMotion()

const handlers = new Map<string, (el: HTMLElement) => void>([
    ["counter", counter],
    ["parallax", parallax],
    ["magnetic", magnetic],
    ["marquee", marquee],
    ["tap", tap],
    ["roll", roll],
    ["reveal", reveal],
    ["tilt", tilt],
    ["error-code", errorCode],
])

const BUTTON_SELECTOR = ".btn-primary, .btn-secondary, .btn-ghost"

const init = (): void => {
    teardown()
    if (isReduced()) {
        for (const el of document.querySelectorAll<HTMLElement>("[data-motion='counter']")) {
            const source = el.dataset.to ?? el.textContent
            const target = parseFloat(source.replace(/,/g, ""))
            if (Number.isNaN(target)) continue
            el.textContent = formatFrom(source)(target)
        }
        return
    }
    const elements = document.querySelectorAll<HTMLElement>("[data-motion]")
    for (const el of elements) {
        const kinds = (el.dataset.motion ?? "").split(/\s+/).filter(Boolean)
        for (const kind of kinds) {
            const handler = handlers.get(kind)
            if (handler) handler(el)
        }
    }
    for (const btn of document.querySelectorAll<HTMLElement>(BUTTON_SELECTOR)) {
        enableRoll(btn)
    }
}

const onReducedChange = (): void => {
    if (reducedQuery.matches) {
        snapFinal()
        teardown()
    } else {
        init()
    }
}

const onVisibilityChange = (): void => {
    if (document.hidden) {
        for (const controls of marqueeControls) controls.pause()
    } else {
        for (const controls of marqueeControls) controls.play()
    }
}

onPageLoad(init)
onBeforeSwap(teardown)
reducedQuery.addEventListener("change", onReducedChange)
document.addEventListener("visibilitychange", onVisibilityChange)
