import { animate, initPrefersReducedMotion, prefersReducedMotion } from "motion"
import type { AnimationPlaybackControls } from "motion"
import type { TransitionBeforePreparationEvent } from "astro:transitions/client"

initPrefersReducedMotion()

const SLAT_SIZE = 64
const COVER_DURATION = 0.5
const REVEAL_DURATION = 0.5
const BLINDS_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]
const COVER_WAIT_MS = 1100
const SAFETY_TIMEOUT_MS = 4000
const TITLE_FALLBACK = "edgarcnp.dev"
const TITLE_Y_OFFSET = 32

const TITLES: { pattern: RegExp, title: string }[] = [
    { pattern: /^\/projects(?:\/.*)?$/, title: "Projects" },
    { pattern: /^\/writings(?:\/.*)?$/, title: "Writings" },
    { pattern: /^\/contact$/, title: "Contact" },
    { pattern: /^\/$/, title: "Home" },
]

const getTransitionTitle = (pathname: string): string => {
    for (const { pattern, title } of TITLES) {
        if (pattern.test(pathname)) return title
    }
    return TITLE_FALLBACK
}

let overlay: HTMLDivElement | null = null
let slats: HTMLDivElement[] = []
let titleElement: HTMLDivElement | null = null
let coverPromise: Promise<void> | null = null
let safetyTimer: number | null = null
let transitionTitle = ""

const reducedMotion = (): boolean => prefersReducedMotion.current === true

const canCurtain = (): boolean => typeof document.startViewTransition === "function"

const settleOrTimeout = (controls: AnimationPlaybackControls[], duration: number): Promise<void> =>
    Promise.race([
        Promise.allSettled(controls.map((control) => control.finished)).then(() => undefined),
        new Promise<void>((resolve) => {
            window.setTimeout(resolve, (duration * 1000) + 600)
        }),
    ])

const mountOverlay = (): void => {
    document.querySelectorAll(".curtains").forEach((element) => element.remove())
    overlay = document.createElement("div")
    overlay.className = "curtains"
    overlay.setAttribute("aria-hidden", "true")
    const count = Math.ceil(window.innerHeight / SLAT_SIZE)
    slats = []
    for (let i = 0; i < count; i++) {
        const slat = document.createElement("div")
        slat.className = "curtains__slat"
        slat.style.top = `${(i * 100) / count}%`
        slat.style.height = `calc(${100 / count}% + 1px)`
        slat.style.transformOrigin = "center top"
        overlay.appendChild(slat)
        slats.push(slat)
    }
    titleElement = document.createElement("div")
    titleElement.className = "curtains__title"
    titleElement.textContent = transitionTitle
    overlay.appendChild(titleElement)
    document.documentElement.appendChild(overlay)
}

const clearSafetyTimer = (): void => {
    if (safetyTimer !== null) {
        window.clearTimeout(safetyTimer)
        safetyTimer = null
    }
}

const runCover = async (): Promise<void> => {
    if (!overlay) mountOverlay()
    const controls = slats.map((slat, index) =>
        animate(slat, { transform: ["scaleY(0)", "scaleY(1)"] }, {
            duration: COVER_DURATION,
            ease: BLINDS_EASE,
            delay: index * (0.4 / slats.length),
        }),
    )
    if (titleElement) {
        controls.push(animate(titleElement, {
            opacity: [0, 1],
            transform: [`translateY(-${TITLE_Y_OFFSET}px)`, "translateY(0)"],
        }, {
            duration: COVER_DURATION,
            ease: BLINDS_EASE,
            delay: 0.25,
        }))
    }
    await settleOrTimeout(controls, COVER_DURATION)
}

const startCover = (): void => {
    if (reducedMotion() || !canCurtain()) return
    if (coverPromise) return
    coverPromise = runCover().finally(() => {
        coverPromise = null
    })
}

const waitForCover = (): Promise<void> => {
    if (!coverPromise) return Promise.resolve()
    return Promise.race([
        coverPromise,
        new Promise<void>((resolve) => {
            window.setTimeout(resolve, COVER_WAIT_MS)
        }),
    ])
}

const snapSlatsClosed = (): Promise<void> =>
    new Promise<void>((resolve) => {
        for (const slat of slats) {
            for (const animation of slat.getAnimations()) {
                animation.finish()
            }
            slat.style.transform = "scaleY(1)"
        }
        if (titleElement) {
            for (const animation of titleElement.getAnimations()) {
                animation.finish()
            }
        }
        const fallback = window.setTimeout(resolve, 150)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.clearTimeout(fallback)
                resolve()
            })
        })
    })

const runReveal = (): void => {
    const currentOverlay = overlay
    if (!currentOverlay) return
    for (const slat of slats) {
        slat.style.transformOrigin = "center bottom"
    }
    const controls = slats.map((slat, index) =>
        animate(slat, { transform: ["scaleY(1)", "scaleY(0)"] }, {
            duration: REVEAL_DURATION,
            ease: BLINDS_EASE,
            delay: index * (0.4 / slats.length),
        }),
    )
    if (titleElement) {
        controls.push(animate(titleElement, {
            opacity: [1, 0],
            transform: ["translateY(0)", `translateY(${TITLE_Y_OFFSET}px)`],
        }, {
            duration: REVEAL_DURATION,
            ease: BLINDS_EASE,
            delay: 0.4 * (1 / 3),
        }))
    }
    void settleOrTimeout(controls, REVEAL_DURATION).then(() => {
        currentOverlay.remove()
        if (overlay === currentOverlay) {
            overlay = null
            slats = []
            titleElement = null
        }
    })
}

const reveal = (): void => {
    clearSafetyTimer()
    runReveal()
}

const armSafety = (): void => {
    clearSafetyTimer()
    safetyTimer = window.setTimeout(reveal, SAFETY_TIMEOUT_MS)
}

const onBeforePreparation = (event: TransitionBeforePreparationEvent): void => {
    if (event.formData) return
    transitionTitle = getTransitionTitle(event.to.pathname)
    startCover()
}

document.addEventListener("astro:before-preparation", onBeforePreparation as EventListener)

const nativeStartViewTransition = (document as unknown as {
    startViewTransition?: (update: () => void | Promise<void>) => ViewTransition
}).startViewTransition

const createShim = (): ViewTransition & {
    resolve: (native: ViewTransition) => void
    reject: (error: unknown) => void
} => {
    let native: ViewTransition | null = null
    let resolveUpdate = (): void => undefined
    let rejectUpdate = (_error: unknown): void => undefined
    let resolveFinished = (): void => undefined
    const updateCallbackDone = new Promise<void>((resolve, reject) => {
        resolveUpdate = resolve
        rejectUpdate = reject
    })
    const finished = new Promise<void>((resolve) => {
        resolveFinished = resolve
    })
    const shim: ViewTransition & {
        resolve: (created: ViewTransition) => void
        reject: (error: unknown) => void
    } = {
        updateCallbackDone,
        ready: updateCallbackDone,
        finished,
        types: new Set<string>(),
        skipTransition: (): void => {
            native?.skipTransition()
        },
        resolve: (created: ViewTransition): void => {
            native = created
            void created.updateCallbackDone.then(resolveUpdate, rejectUpdate)
            void created.finished.finally(resolveFinished)
        },
        reject: rejectUpdate,
    }
    return shim
}

if (nativeStartViewTransition) {
    document.startViewTransition = (update: () => void | Promise<void>): ViewTransition => {
        const shim = createShim()
        void (async () => {
            try {
                await waitForCover()
                await snapSlatsClosed()
                armSafety()
                shim.resolve(nativeStartViewTransition.call(document, async () => {
                    try {
                        await update()
                    } finally {
                        reveal()
                    }
                }))
            } catch (error) {
                shim.reject(error)
            }
        })()
        return shim
    }
}
