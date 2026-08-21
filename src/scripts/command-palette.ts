import { animate, initPrefersReducedMotion, prefersReducedMotion } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { navigate } from "astro:transitions/client"

interface Command { id: string, label: string, href: string, category: string, keywords?: string[] }

initPrefersReducedMotion()

const reduced = (): boolean => prefersReducedMotion.current === true
const windowRef = window as unknown as { __paletteBound?: boolean }

const INDEX_SELECTOR = "script[type='application/json'][data-command-index]"
const TRIGGER_SELECTOR = ".palette-trigger"
const OVERLAY_CLASS = "palette-overlay"
const PANEL_CLASS = "palette-panel"
const ENTRANCE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

let commands: Command[] = []
let filtered: Command[] = []
let active = -1
let open = false

let trigger: HTMLButtonElement | null = null
let optionEls: HTMLElement[] = []

let overlay: HTMLDivElement | null = null
let dialog: HTMLElement | null = null
let input: HTMLInputElement | null = null
let list: HTMLElement | null = null
let highlight: HTMLElement | null = null
let highlightControls: AnimationPlaybackControls | null = null

const loadIndex = (): void => {
    const script = document.querySelector<HTMLScriptElement>(INDEX_SELECTOR)
    if (!script?.textContent) return
    try {
        commands = JSON.parse(script.textContent) as Command[]
    } catch {
        commands = []
    }
}

const bindTrigger = (element: HTMLButtonElement): void => {
    const bound = element as HTMLButtonElement & { __paletteBound?: boolean }
    if (bound.__paletteBound) return
    bound.__paletteBound = true
    bound.addEventListener("click", () => {
        if (open) closePalette()
        else openPalette()
    })
}

const optionLabel = (index: number): string => `palette-option-${index}`

const buildPanel = (): void => {
    overlay = document.createElement("div")
    overlay.className = OVERLAY_CLASS
    overlay.dataset.palette = "overlay"
    overlay.addEventListener("mousedown", closePalette)

    dialog = document.createElement("div")
    dialog.className = PANEL_CLASS
    dialog.setAttribute("role", "dialog")
    dialog.setAttribute("aria-modal", "true")
    dialog.setAttribute("aria-label", "Search")

    const inputRow = document.createElement("div")
    inputRow.className = "palette-input-row"

    input = document.createElement("input")
    input.className = "palette-input"
    input.type = "text"
    input.placeholder = "Search commands, projects, writings…"
    input.setAttribute("role", "combobox")
    input.setAttribute("aria-autocomplete", "list")
    input.setAttribute("aria-expanded", "true")
    input.setAttribute("aria-controls", "palette-listbox")
    input.setAttribute("aria-activedescendant", "")
    input.addEventListener("input", () => {
        filter(input?.value ?? "")
    })

    inputRow.appendChild(input)
    dialog.appendChild(inputRow)

    list = document.createElement("div")
    list.className = "palette-list"
    list.id = "palette-listbox"
    list.setAttribute("role", "listbox")
    dialog.appendChild(list)

    const footer = document.createElement("div")
    footer.className = "palette-footer"
    const hints = document.createElement("div")
    hints.className = "palette-footer__group"
    hints.innerHTML = "<span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>"
    footer.appendChild(hints)

    const count = document.createElement("span")
    count.className = "palette-footer__count"
    footer.appendChild(count)
    dialog.appendChild(footer)

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
}

const renderList = (): void => {
    if (!list) return
    list.textContent = ""
    optionEls = []

    if (filtered.length === 0) {
        const empty = document.createElement("div")
        empty.className = "palette-empty"
        empty.textContent = "No results"
        list.appendChild(empty)
        return
    }

    highlight = document.createElement("div")
    highlight.className = "palette-highlight"
    highlight.style.opacity = "0"
    list.appendChild(highlight)

    filtered.forEach((command, index) => {
        const option = document.createElement("button")
        option.type = "button"
        option.className = "palette-option"
        option.id = optionLabel(index)
        option.setAttribute("role", "option")
        option.setAttribute("aria-selected", "false")
        option.tabIndex = -1

        const label = document.createElement("span")
        label.className = "palette-option__label"
        label.textContent = command.label

        const category = document.createElement("span")
        category.className = "palette-option__category"
        category.textContent = command.category

        option.appendChild(label)
        option.appendChild(category)

        option.addEventListener("mouseenter", () => setActive(index))
        option.addEventListener("click", () => choose(command))

        list?.appendChild(option)
        optionEls.push(option)
    })
}

const filter = (query: string): void => {
    const normalized = query.trim().toLowerCase()
    filtered = normalized
        ? commands.filter((command) =>
            `${command.label} ${command.category} ${(command.keywords ?? []).join(" ")}`.toLowerCase().includes(normalized),
        )
        : commands.filter((command) => command.category === "Nav")
    active = -1
    renderList()
    setActive(0)
}

const positionHighlight = (): void => {
    if (!highlight || optionEls.length === 0 || active < 0 || active >= optionEls.length) {
        if (highlight) highlight.style.opacity = "0"
        return
    }
    const option = optionEls[active]
    const target = {
        left: option.offsetLeft,
        top: option.offsetTop,
        width: option.offsetWidth,
        height: option.offsetHeight,
    }
    highlight.style.opacity = "1"
    highlightControls?.stop()
    if (reduced()) {
        highlight.style.left = `${target.left}px`
        highlight.style.top = `${target.top}px`
        highlight.style.width = `${target.width}px`
        highlight.style.height = `${target.height}px`
        return
    }
    highlightControls = animate(highlight, target, {
        type: "spring",
        stiffness: 350,
        damping: 30,
    })
}

const setActive = (index: number): void => {
    if (filtered.length === 0) {
        active = -1
        positionHighlight()
        return
    }
    const next = Math.max(0, Math.min(index, filtered.length - 1))
    active = next
    optionEls.forEach((option, optionIndex) => {
        const isActive = optionIndex === active
        option.classList.toggle("is-active", isActive)
        option.setAttribute("aria-selected", String(isActive))
    })
    const current = optionEls[active]
    if (input) {
        input.setAttribute("aria-activedescendant", current.id)
        current.scrollIntoView({ block: "nearest" })
    }
    positionHighlight()
}

const move = (step: number): void => {
    if (filtered.length === 0) return
    const next = (active + step + filtered.length) % filtered.length
    setActive(next)
}

const openPalette = (): void => {
    if (open) return
    document.querySelectorAll<HTMLElement>(`.${OVERLAY_CLASS}, .${PANEL_CLASS}`).forEach((element) => element.remove())
    open = true
    buildPanel()
    filter("")
    setActive(0)
    input?.focus()
    trigger?.setAttribute("aria-expanded", "true")
    document.documentElement.style.overflow = "hidden"

    if (!overlay || !dialog) return
    if (reduced()) {
        overlay.style.opacity = "1"
        dialog.style.opacity = "1"
        return
    }
    animate(overlay, { opacity: [0, 1] }, { duration: 0.18, ease: "easeOut" })
    animate(
        dialog,
        { opacity: [0, 1], transform: ["translateY(8px) scale(0.98)", "translateY(0) scale(1)"] },
        { duration: 0.2, ease: ENTRANCE_EASE },
    )
}

const closePalette = (): void => {
    if (!open) return
    open = false
    highlightControls?.stop()
    highlightControls = null

    const currentOverlay = overlay
    const currentDialog = dialog

    trigger?.setAttribute("aria-expanded", "false")
    trigger?.focus()
    document.documentElement.style.overflow = ""

    const teardown = (): void => {
        currentOverlay?.remove()
        currentDialog?.remove()
        if (overlay === currentOverlay) overlay = null
        if (dialog === currentDialog) dialog = null
        input = null
        list = null
        highlight = null
        optionEls = []
    }

    if (!currentOverlay || !currentDialog) {
        teardown()
        return
    }
    if (reduced()) {
        teardown()
        return
    }
    animate(currentOverlay, { opacity: 0 }, { duration: 0.15, ease: "easeOut" })
    const controls = animate(
        currentDialog,
        { opacity: 0, transform: "translateY(8px) scale(0.98)" },
        { duration: 0.15, ease: ENTRANCE_EASE },
    )
    void Promise.race([
        controls.finished,
        new Promise<void>((resolve) => {
            window.setTimeout(resolve, 250)
        }),
    ]).then(teardown)
}

const choose = (command: Command): void => {
    closePalette()
    void navigate(command.href)
}

const onKeydown = (event: KeyboardEvent): void => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (open) closePalette()
        else openPalette()
        return
    }
    if (!open) return
    switch (event.key) {
        case "Escape":
            event.preventDefault()
            closePalette()
            break
        case "ArrowDown":
            event.preventDefault()
            move(1)
            break
        case "ArrowUp":
            event.preventDefault()
            move(-1)
            break
        case "Home":
            event.preventDefault()
            setActive(0)
            break
        case "End":
            event.preventDefault()
            setActive(filtered.length - 1)
            break
        case "Enter":
            event.preventDefault()
            if (active >= 0 && filtered[active]) choose(filtered[active])
            break
        default:
            break
    }
}

const onResize = (): void => {
    if (open) positionHighlight()
}

const boot = (): void => {
    const stale = document.querySelectorAll<HTMLElement>(`.${OVERLAY_CLASS}, .${PANEL_CLASS}`)
    stale.forEach((element) => element.remove())
    document.documentElement.style.overflow = ""

    loadIndex()
    trigger = document.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR)
    if (trigger) bindTrigger(trigger)
    open = false
}

if (!windowRef.__paletteBound) {
    windowRef.__paletteBound = true
    document.addEventListener("keydown", onKeydown)
    window.addEventListener("resize", onResize)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true })
    } else {
        boot()
    }
    document.addEventListener("astro:page-load", boot)
}

boot()
