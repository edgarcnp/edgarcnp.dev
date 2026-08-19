import {
    animate,
    easeOut,
    inView,
    initPrefersReducedMotion,
    prefersReducedMotion,
    scroll,
} from "motion"
import type { AnimationPlaybackControls } from "motion"

type Stop = () => void

const viewport = { margin: "-40px" } as const
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
const registry: Stop[] = []
const scanned = new Set<HTMLElement>()
const counterFinals = new WeakMap<HTMLElement, string>()
let marqueeControls: AnimationPlaybackControls[] = []

initPrefersReducedMotion()

const isReduced = () => prefersReducedMotion.current === true

const stopAll = () => {
    for (const stop of registry) stop()
    registry.length = 0
}

const teardown = () => {
    stopAll()
    scanned.clear()
    marqueeControls = []
}

const snapFinal = () => {
    for (const el of scanned) {
        el.style.opacity = "1"
        el.style.transform = "none"
        const final = counterFinals.get(el)
        if (final !== undefined) el.textContent = final
    }
}

const decimalsOf = (text: string) => {
    const separator = Math.max(text.lastIndexOf("."), text.lastIndexOf(","))
    return separator === -1 ? 0 : text.length - separator - 1
}

const formatFrom = (source: string): ((value: number) => string) => {
    const enUS = /\d{1,3}(,\d{3})+/.test(source)
    const deDE = /\d{1,3}(\.\d{3})+/.test(source)
    if (enUS || deDE) {
        const locale = enUS ? "en-US" : "de-DE"
        const decimals = enUS ? decimalsOf(source.replace(/,/g, "")) : decimalsOf(source.replace(/\./g, ""))
        const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: decimals })
        return (value) => formatter.format(value)
    }
    const decimals = decimalsOf(source)
    if (decimals > 0) return (value) => value.toFixed(decimals)
    return (value) => Math.round(value).toString()
}

const counter = (el: HTMLElement) => {
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

const parallax = (el: HTMLElement) => {
    const speed = parseFloat(el.dataset.speed ?? "") || 0.15
    scanned.add(el)
    registry.push(
        scroll(
            (progress: number) => {
                if (!el.isConnected) return
                el.style.transform = `translateY(${-30 * speed * progress}px)`
            },
            { target: el, offset: ["start end", "end start"] },
        ),
    )
}

const magnetic = (el: HTMLElement) => {
    if (reducedQuery.matches || !window.matchMedia("(pointer: fine)").matches) return
    let xPosition = 0
    let yPosition = 0
    let xControls: AnimationPlaybackControls | null = null
    let yControls: AnimationPlaybackControls | null = null
    const applyTransform = () => {
        el.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0)`
    }
    const springTo = (targetX: number, targetY: number) => {
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
    const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        const centerX = rect.left + (rect.width / 2)
        const centerY = rect.top + (rect.height / 2)
        const deltaX = event.clientX - centerX
        const deltaY = event.clientY - centerY
        if ((deltaX * deltaX) + (deltaY * deltaY) <= 8100) {
            springTo(deltaX * 0.3, deltaY * 0.3)
        } else {
            springTo(0, 0)
        }
    }
    const onLeave = () => springTo(0, 0)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)
    scanned.add(el)
    registry.push(() => {
        el.removeEventListener("pointermove", onMove)
        el.removeEventListener("pointerleave", onLeave)
        xControls?.stop()
        yControls?.stop()
    })
}

const marquee = (el: HTMLElement) => {
    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return
    const duration = parseFloat(el.dataset.duration ?? "") || 20
    scanned.add(el)
    for (const child of children) {
        scanned.add(child)
        const controls = animate(child, { x: "-50%" }, { duration, ease: "linear", repeat: Infinity })
        marqueeControls.push(controls)
        registry.push(() => controls.stop())
    }
}

const tap = (el: HTMLElement) => {
    if (reducedQuery.matches) return
    let controls: AnimationPlaybackControls | null = null
    const press = () => {
        controls?.stop()
        controls = animate(el, { scale: 0.97 }, { type: "spring", stiffness: 300, damping: 25 })
    }
    const release = () => {
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

const handlers = new Map<string, (el: HTMLElement) => void>([
    ["counter", counter],
    ["parallax", parallax],
    ["magnetic", magnetic],
    ["marquee", marquee],
    ["tap", tap],
])

const init = () => {
    teardown()
    if (isReduced()) return
    const elements = document.querySelectorAll<HTMLElement>("[data-motion]")
    for (const el of elements) {
        const kind = el.dataset.motion
        if (kind === undefined) continue
        const handler = handlers.get(kind)
        if (handler) handler(el)
    }
}

const onReducedChange = () => {
    if (reducedQuery.matches) {
        snapFinal()
        teardown()
    } else {
        init()
    }
}

const onVisibilityChange = () => {
    if (document.hidden) {
        for (const controls of marqueeControls) controls.pause()
    } else {
        for (const controls of marqueeControls) controls.play()
    }
}

const boot = () => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true })
    } else {
        init()
    }
    document.addEventListener("astro:page-load", init)
    document.addEventListener("astro:before-swap", teardown)
    reducedQuery.addEventListener("change", onReducedChange)
    document.addEventListener("visibilitychange", onVisibilityChange)
}

boot()
