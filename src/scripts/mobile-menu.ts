import { animate, initPrefersReducedMotion, prefersReducedMotion, stagger } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { navigate } from "astro:transitions/client"

type DotsPath = SVGPathElement

interface Command {
    id: string
    label: string
    href: string
    category: string
    keywords?: string[]
}

const windowRef = window as unknown as { __mobileMenuBound?: boolean }

initPrefersReducedMotion()

/* Matches the desktop chrome (>=64rem), i.e. the width at which the dot-morph
   menu is replaced by the inline nav. Below this — compact phones, tablets, and
   phones held sideways — the menu stays available, so it is not force-closed.
   Keep in sync with the desktop: variant and the chrome media queries in
   components.css. */
const BREAKPOINT = window.matchMedia("(min-width: 64rem)")
const BUTTON_SELECTOR = ".dots-morph-button.mobile-menu"
const PANEL_SELECTOR = "#mobile-menu-panel"
const BACKDROP_SELECTOR = "#mobile-menu-backdrop"
const INDEX_SELECTOR = "script[type='application/json'][data-command-index]"
const INPUT_SELECTOR = "#mobile-menu-input"
const RESULTS_SELECTOR = "#mobile-menu-results"
const SPRING = { type: "spring", stiffness: 170, damping: 26 } as const
const SCALE_SPRING = { type: "spring", stiffness: 300, damping: 25 } as const
const RELEASE_SPRING = { type: "spring", stiffness: 300, damping: 17 } as const
const WOBBLE_SPRING = { type: "spring", stiffness: 170, damping: 20 } as const
const BLUR_CLOSED = "blur(0px) saturate(100%)"
const BLUR_OPEN = "blur(20px) saturate(180%)"

const DOT_STATES: { dot: string, line: string }[] = [
    { dot: "M27.75 27.75L27.7499 27.7499", line: "M15.75 15.75L27.75 27.75" },
    { dot: "M27.75 3.75L27.7499 3.75007", line: "M15.75 15.75L27.75 3.75" },
    { dot: "M3.75 27.75L3.75007 27.7499", line: "M15.75 15.75L3.75 27.75" },
    { dot: "M3.75 3.75L3.75007 3.75007", line: "M3.75 3.75L14.75 14.75" },
]

interface State {
    open: boolean
    wrapper: HTMLElement | null
    button: HTMLButtonElement | null
    panel: HTMLElement | null
    backdrop: HTMLElement | null
    paths: DotsPath[]
    pathControls: AnimationPlaybackControls[]
    wrapperControls: AnimationPlaybackControls | null
    scaleControls: AnimationPlaybackControls | null
    panelControls: AnimationPlaybackControls | null
    itemControls: AnimationPlaybackControls | null
    backdropControls: AnimationPlaybackControls | null
    hovering: boolean
    pressing: boolean
}

const state: State = {
    open: false,
    wrapper: null,
    button: null,
    panel: null,
    backdrop: null,
    paths: [],
    pathControls: [],
    wrapperControls: null,
    scaleControls: null,
    panelControls: null,
    itemControls: null,
    backdropControls: null,
    hovering: false,
    pressing: false,
}

let commands: Command[] = []
let filteredResults: Command[] = []
let resultEls: HTMLElement[] = []
let activeResult = -1
let input: HTMLInputElement | null = null
let results: HTMLElement | null = null
let navList: HTMLElement | null = null
let transitionId = 0

const reduced = (): boolean => prefersReducedMotion.current === true

const loadCommands = (): void => {
    const script = document.querySelector<HTMLScriptElement>(INDEX_SELECTOR)
    if (!script?.textContent) {
        commands = []
        return
    }
    try {
        commands = JSON.parse(script.textContent) as Command[]
    } catch {
        commands = []
    }
}

const stopAll = (): void => {
    for (const controls of state.pathControls) controls.stop()
    state.pathControls = []
    state.wrapperControls?.stop()
    state.wrapperControls = null
    state.scaleControls?.stop()
    state.scaleControls = null
    state.panelControls?.stop()
    state.panelControls = null
    state.itemControls?.stop()
    state.itemControls = null
    state.backdropControls?.stop()
    state.backdropControls = null
    for (const item of state.panel?.querySelectorAll<HTMLElement>(".mobile-menu-panel__item") ?? []) {
        item.style.opacity = ""
        item.style.transform = ""
    }
}

const setAttr = (path: DotsPath, key: string, value: string): void => {
    path.setAttribute(key, value)
}

const applyStatic = (open: boolean): void => {
    state.paths.forEach((path, index) => {
        setAttr(path, "d", open ? DOT_STATES[index].line : DOT_STATES[index].dot)
        setAttr(path, "stroke-width", open ? "6" : "12")
    })
    state.wrapper?.style.setProperty("transform", `rotate(${open ? 90 : 0}deg)`, "important")
    if (state.backdrop) {
        state.backdrop.style.backdropFilter = open ? BLUR_OPEN : ""
        state.backdrop.style.setProperty("-webkit-backdrop-filter", open ? BLUR_OPEN : "")
    }
}

const setScale = (
    target: number,
    spring: { type: "spring", stiffness: number, damping: number } = SCALE_SPRING,
): void => {
    if (!state.button) return
    if (reduced()) {
        state.button.style.transform = `scale(${target})`
        return
    }
    state.scaleControls?.stop()
    state.scaleControls = animate(state.button, { scale: target }, spring)
}

const focusFirst = (): void => {
    const focusable = state.panel?.querySelector<HTMLElement>(".mobile-menu-panel__list a, .mobile-menu-panel__list button")
        ?? state.panel?.querySelector<HTMLElement>("a, button")
    focusable?.focus({ preventScroll: true })
}

const focusButton = (): void => {
    state.button?.focus({ preventScroll: true })
}

const updateA11y = (): void => {
    const open = state.open
    state.button?.setAttribute("aria-expanded", String(open))
    state.button?.setAttribute("aria-label", open ? "Close menu" : "Open menu")
    state.button?.setAttribute("title", open ? "Close menu" : "Open menu")
    state.panel?.setAttribute("aria-hidden", String(!open))
    state.backdrop?.setAttribute("aria-hidden", String(!open))
}

const setScrollLock = (locked: boolean): void => {
    document.documentElement.style.overflow = locked ? "hidden" : ""
}

const clearPressedLinks = (): void => {
    for (const link of state.panel?.querySelectorAll<HTMLElement>(".mobile-menu-link.is-pressed") ?? []) {
        link.classList.remove("is-pressed")
    }
}

const filterCommands = (query: string): Command[] => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return commands.filter((command) =>
        `${command.label} ${command.category} ${(command.keywords ?? []).join(" ")}`.toLowerCase().includes(normalized),
    )
}

const renderResults = (hasQuery: boolean): void => {
    if (!results) return
    const list = results
    list.textContent = ""
    resultEls = []
    if (!hasQuery) {
        list.hidden = true
        return
    }
    list.hidden = false
    if (filteredResults.length === 0) {
        const empty = document.createElement("div")
        empty.className = "mobile-menu-empty"
        empty.textContent = "No results"
        list.appendChild(empty)
        return
    }
    filteredResults.forEach((command, index) => {
        const result = document.createElement("button")
        result.type = "button"
        result.className = "mobile-menu-result"
        result.setAttribute("role", "option")
        result.setAttribute("aria-selected", "false")
        const label = document.createElement("span")
        label.className = "mobile-menu-result__label"
        label.textContent = command.label
        const category = document.createElement("span")
        category.className = "mobile-menu-result__category"
        category.textContent = command.category
        result.append(label, category)
        result.addEventListener("mouseenter", () => setActiveResult(index))
        result.addEventListener("click", () => choose(command))
        list.appendChild(result)
        resultEls.push(result)
    })
    setActiveResult(0)
}

const setActiveResult = (index: number): void => {
    if (filteredResults.length === 0) {
        activeResult = -1
        return
    }
    activeResult = Math.max(0, Math.min(index, filteredResults.length - 1))
    resultEls.forEach((element, elementIndex) => {
        element.classList.toggle("is-active", elementIndex === activeResult)
        element.setAttribute("aria-selected", String(elementIndex === activeResult))
    })
    resultEls[activeResult]?.scrollIntoView({ block: "nearest" })
}

const resetSearch = (): void => {
    if (input) input.value = ""
    filteredResults = []
    activeResult = -1
    renderResults(false)
    if (navList) navList.hidden = false
}

const onInput = (): void => {
    const query = input?.value ?? ""
    const hasQuery = query.trim().length > 0
    filteredResults = filterCommands(query)
    activeResult = -1
    renderResults(hasQuery)
    if (navList) navList.hidden = hasQuery
}

const choose = (command: Command): void => {
    closeMenu(false)
    void navigate(command.href)
}

const closeMenu = (restoreFocus: boolean): void => {
    if (!state.open) return
    state.open = false
    updateA11y()
    setScrollLock(false)
    resetSearch()

    if (reduced() || !state.panel || !state.backdrop) {
        clearPressedLinks()
        if (state.panel) state.panel.hidden = true
        if (state.backdrop) {
            state.backdrop.hidden = true
            state.backdrop.classList.remove("is-open")
        }
        applyStatic(false)
        if (restoreFocus) focusButton()
        return
    }

    const panel = state.panel
    const backdrop = state.backdrop
    const gen = ++transitionId
    clearPressedLinks()
    stopAll()
    backdrop.classList.remove("is-open")

    const panelHidden = animate(
        panel,
        { opacity: 0, transform: "scale(0.9)" },
        SPRING,
    )
    void Promise.race([
        panelHidden.finished,
        new Promise<void>((resolve) => {
            window.setTimeout(resolve, 450)
        }),
    ]).then(() => {
        if (gen !== transitionId || state.open) return
        panel.style.opacity = "0"
        panel.hidden = true
        state.panelControls = null
    })
    state.panelControls = panelHidden

    state.backdropControls = animate(
        backdrop,
        { opacity: [1, 0], backdropFilter: [BLUR_OPEN, BLUR_CLOSED], WebkitBackdropFilter: [BLUR_OPEN, BLUR_CLOSED] } as never,
        SPRING,
    )
    state.backdropControls.finished
        .then(() => {
            if (gen !== transitionId || state.open) return
            backdrop.style.opacity = "0"
            backdrop.hidden = true
            backdrop.style.backdropFilter = ""
            backdrop.style.removeProperty("-webkit-backdrop-filter")
        })
        .catch(() => undefined)

    for (const path of state.paths) {
        const index = state.paths.indexOf(path)
        state.pathControls.push(
            animate(path, { d: DOT_STATES[index].dot, strokeWidth: 12 }, SPRING),
        )
    }
    state.wrapperControls = animate(state.wrapper, { rotate: 0 }, WOBBLE_SPRING)

    if (restoreFocus) focusButton()
}

const openMenu = (): void => {
    if (state.open || !state.panel || !state.backdrop) return
    state.open = true
    transitionId++
    updateA11y()
    setScrollLock(true)
    resetSearch()
    setPanelTop()

    state.backdrop.hidden = false
    state.backdrop.classList.add("is-open")
    state.panel.hidden = false

    if (reduced()) {
        applyStatic(true)
        focusFirst()
        return
    }

    stopAll()
    for (const path of state.paths) {
        const index = state.paths.indexOf(path)
        state.pathControls.push(
            animate(path, { d: DOT_STATES[index].line, strokeWidth: 6 }, SPRING),
        )
    }
    state.wrapperControls = animate(state.wrapper, { rotate: 90 }, SPRING)

    const panelRect = state.panel.getBoundingClientRect()
    const buttonRect = state.button?.getBoundingClientRect()
    if (buttonRect && panelRect.width > 0 && panelRect.height > 0) {
        const x = ((buttonRect.left + (buttonRect.width / 2) - panelRect.left) / panelRect.width) * 100
        const y = ((buttonRect.top + (buttonRect.height / 2) - panelRect.top) / panelRect.height) * 100
        state.panel.style.transformOrigin = `${x}% ${y}%`
    }

    const panel = state.panel
    const backdrop = state.backdrop
    const items = Array.from(state.panel.querySelectorAll<HTMLElement>(".mobile-menu-panel__item"))

    state.panelControls = animate(
        panel,
        { opacity: [0, 1], transform: ["scale(0.85)", "scale(1)"] },
        SPRING,
    )
    state.panelControls.finished
        .then(() => {
            if (!state.open) return
            panel.style.opacity = "1"
            panel.style.transform = "none"
        })
        .catch(() => undefined)
    state.itemControls = animate(
        items,
        { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0px)"] },
        { ...SPRING, delay: stagger(0.035) },
    )
    state.itemControls.finished
        .then(() => {
            if (!state.open) return
            for (const item of items) {
                item.style.opacity = ""
                item.style.transform = ""
            }
        })
        .catch(() => undefined)
    state.backdropControls = animate(
        backdrop,
        { opacity: [0, 1], backdropFilter: [BLUR_CLOSED, BLUR_OPEN], WebkitBackdropFilter: [BLUR_CLOSED, BLUR_OPEN] } as never,
        SPRING,
    )
    state.backdropControls.finished
        .then(() => {
            if (!state.open) return
            backdrop.style.opacity = "1"
        })
        .catch(() => undefined)
    focusFirst()
}

const toggle = (): void => {
    if (state.open) closeMenu(true)
    else openMenu()
}

const onDocumentClick = (event: MouseEvent): void => {
    if (!state.open) return
    const target = event.target as Node | null
    if (!target) return
    if (state.button?.contains(target)) return
    if (state.panel?.contains(target)) {
        const link = (target as HTMLElement).closest<HTMLElement>("a")
        if (link) closeMenu(false)
        return
    }
    closeMenu(true)
}

const onKeydown = (event: KeyboardEvent): void => {
    if (!state.open) return
    switch (event.key) {
        case "Escape":
            event.preventDefault()
            closeMenu(true)
            break
        case "ArrowDown":
            if (filteredResults.length > 0) {
                event.preventDefault()
                setActiveResult(activeResult + 1)
            }
            break
        case "ArrowUp":
            if (filteredResults.length > 0) {
                event.preventDefault()
                setActiveResult(activeResult - 1)
            }
            break
        case "Enter":
            if (activeResult >= 0 && filteredResults[activeResult]) {
                event.preventDefault()
                choose(filteredResults[activeResult])
            }
            break
        default:
            break
    }
}

const onBreakpoint = (): void => {
    if (BREAKPOINT.matches && state.open) closeMenu(false)
}

const setPanelTop = (): void => {
    const header = document.querySelector<HTMLElement>(".site-header")
    const top = header?.getBoundingClientRect().bottom
    state.panel?.style.setProperty("--menu-panel-top", `${Math.ceil(top ?? 65)}px`)
}

const bind = (): void => {
    stopAll()
    state.button = document.querySelector<HTMLButtonElement>(BUTTON_SELECTOR)
    state.panel = document.querySelector<HTMLElement>(PANEL_SELECTOR)
    state.backdrop = document.querySelector<HTMLElement>(BACKDROP_SELECTOR)

    if (!state.button || !state.panel || !state.backdrop) {
        state.button = null
        state.panel = null
        state.backdrop = null
        state.open = false
        setScrollLock(false)
        return
    }

    state.wrapper = state.button.querySelector<HTMLElement>(".dots-morph-button__wrapper")
    state.paths = Array.from(state.button.querySelectorAll<DotsPath>("path[data-dots-morph]"))
    input = state.panel.querySelector<HTMLInputElement>(INPUT_SELECTOR)
    results = state.panel.querySelector<HTMLElement>(RESULTS_SELECTOR)
    navList = state.panel.querySelector<HTMLElement>(".mobile-menu-panel__list")

    const linkFromPointer = (event: PointerEvent): HTMLElement | null =>
        (event.target as HTMLElement | null)?.closest<HTMLElement>(".mobile-menu-link") ?? null
    state.panel.addEventListener("pointerdown", (event) => {
        linkFromPointer(event)?.classList.add("is-pressed")
    })
    state.panel.addEventListener("pointerup", () => clearPressedLinks())
    state.panel.addEventListener("pointercancel", () => clearPressedLinks())
    state.panel.addEventListener("pointerleave", (event) => {
        linkFromPointer(event)?.classList.remove("is-pressed")
    }, true)

    clearPressedLinks()
    setPanelTop()

    loadCommands()
    resetSearch()
    state.open = false
    state.panel.hidden = true
    state.backdrop.hidden = true
    state.backdrop.classList.remove("is-open")
    state.panel.setAttribute("aria-hidden", "true")
    state.backdrop.setAttribute("aria-hidden", "true")
    applyStatic(false)
    updateA11y()

    const bound = state.button as HTMLButtonElement & { __mobileMenuBound?: boolean }
    if (!bound.__mobileMenuBound) {
        bound.__mobileMenuBound = true
        state.button.addEventListener("click", toggle)
        state.button.addEventListener("pointerenter", () => {
            state.hovering = true
            if (!state.pressing) setScale(1.05)
        })
        state.button.addEventListener("pointerleave", () => {
            state.hovering = false
            if (!state.pressing) setScale(1)
        })
        state.button.addEventListener("pointerdown", () => {
            state.pressing = true
            setScale(0.97)
        })
        state.button.addEventListener("pointerup", () => {
            state.pressing = false
            setScale(state.hovering ? 1.05 : 1, RELEASE_SPRING)
        })
        state.button.addEventListener("pointercancel", () => {
            state.pressing = false
            setScale(state.hovering ? 1.05 : 1, RELEASE_SPRING)
        })
        input?.addEventListener("input", onInput)
    }
}

if (!windowRef.__mobileMenuBound) {
    windowRef.__mobileMenuBound = true
    document.addEventListener("click", onDocumentClick)
    document.addEventListener("keydown", onKeydown)
    BREAKPOINT.addEventListener("change", onBreakpoint)
    document.addEventListener("astro:page-load", bind)
}

bind()
