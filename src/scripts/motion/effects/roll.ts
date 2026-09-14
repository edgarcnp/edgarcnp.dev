import { animate, easeOut } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { registry, scanned } from "../registry"
import { reducedQuery } from "../shared"

// Splits a button's text label into stacked, per-character rolling units.
export const applyRoll = (root: HTMLElement): void => {
    if (root.dataset.rollApplied === "1") return
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const parent = (node as Text).parentElement
            if (!parent) return NodeFilter.FILTER_REJECT
            if (parent.closest("svg, kbd, [aria-hidden], [data-roll-skip]")) return NodeFilter.FILTER_REJECT
            if (!(node.nodeValue ?? "").trim()) return NodeFilter.FILTER_REJECT
            return NodeFilter.FILTER_ACCEPT
        },
    })
    const textNodes: Text[] = []
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text)
    let applied = false
    for (const text of textNodes) {
        const parent = text.parentElement
        if (!parent || parent.dataset.rollApplied === "1") continue
        const value = (text.nodeValue ?? "").trim()
        const roll = document.createElement("span")
        roll.className = "roll"
        for (const char of value) {
            const unit = document.createElement("span")
            unit.className = "roll__char"
            const front = document.createElement("span")
            front.className = "roll__face"
            front.textContent = char
            const dup = document.createElement("span")
            dup.className = "roll__face roll__face--dup"
            dup.textContent = char
            dup.setAttribute("aria-hidden", "true")
            unit.append(front, dup)
            roll.append(unit)
        }
        parent.replaceChild(roll, text)
        parent.dataset.rollApplied = "1"
        applied = true
    }
    if (applied) root.dataset.rollApplied = "1"
}

export const playRoll = (root: HTMLElement, hovered: boolean, baseDelay = 0): AnimationPlaybackControls[] => {
    const controls: AnimationPlaybackControls[] = []
    let index = 0
    for (const unit of root.querySelectorAll<HTMLElement>(".roll__char")) {
        const front = unit.querySelector<HTMLElement>(".roll__face:not(.roll__face--dup)")
        const dup = unit.querySelector<HTMLElement>(".roll__face--dup")
        if (!front || !dup) continue
        const opts = { duration: 0.3, ease: easeOut, delay: (index * 0.012) + baseDelay }
        controls.push(animate(front, { y: hovered ? ["0%", "-100%"] : ["-100%", "0%"] }, opts))
        controls.push(animate(dup, { y: hovered ? ["100%", "0%"] : ["0%", "100%"] }, opts))
        index++
    }
    return controls
}

export const enableRoll = (el: HTMLElement): void => {
    applyRoll(el)
    if (reducedQuery.matches) return
    if (el.dataset.rollEnable === "1") return
    if (!el.querySelector(".roll")) return
    el.dataset.rollEnable = "1"
    let controls: AnimationPlaybackControls[] = []
    const play = (hovered: boolean): void => {
        for (const c of controls) c.stop()
        controls = playRoll(el, hovered)
    }
    const onEnter = (): void => play(true)
    const onLeave = (): void => play(false)
    el.addEventListener("pointerenter", onEnter)
    el.addEventListener("pointerleave", onLeave)
    scanned.add(el)
    registry.push(() => {
        el.removeEventListener("pointerenter", onEnter)
        el.removeEventListener("pointerleave", onLeave)
        for (const c of controls) c.stop()
    })
}

export const roll = (el: HTMLElement): void => {
    if (reducedQuery.matches) return
    enableRoll(el)
}
