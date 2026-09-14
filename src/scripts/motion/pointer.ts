export interface PointerDelta {
    dx: number
    dy: number
    rect: DOMRect
}

/** Calls onMove with the pointer offset from the element center; returns a cleanup. */
export function trackPointer(
    el: HTMLElement,
    onMove: (delta: PointerDelta) => void,
    onLeave: () => void,
): () => void {
    const handleMove = (event: PointerEvent): void => {
        const rect = el.getBoundingClientRect()
        onMove({
            dx: event.clientX - (rect.left + (rect.width / 2)),
            dy: event.clientY - (rect.top + (rect.height / 2)),
            rect,
        })
    }
    const handleLeave = (): void => onLeave()
    el.addEventListener("pointermove", handleMove)
    el.addEventListener("pointerleave", handleLeave)
    return () => {
        el.removeEventListener("pointermove", handleMove)
        el.removeEventListener("pointerleave", handleLeave)
    }
}
