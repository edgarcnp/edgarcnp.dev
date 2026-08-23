import { animate, initPrefersReducedMotion, prefersReducedMotion } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { navigate } from "astro:transitions/client"
import { ChevronDown, ChevronUp, CornerDownLeft, createElement } from "lucide"
import type { IconNode } from "lucide"

interface Command { id: string, label: string, href: string, category: string, keywords?: string[] }

initPrefersReducedMotion()

const reduced = (): boolean => prefersReducedMotion.current === true
const windowRef = window as unknown as { __paletteBound?: boolean }

const INDEX_SELECTOR = "script[type='application/json'][data-command-index]"
const FIELD_SELECTOR = ".palette-field"
const INPUT_SELECTOR = ".palette-input"
const PANEL_CLASS = "palette-panel"
const ENTRANCE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const iconElement = (icon: IconNode): SVGElement => createElement(icon, { width: 10, height: 10, "aria-hidden": "true" })

const hint = (keys: (SVGElement | string)[], label: string): HTMLSpanElement => {
    const span = document.createElement("span")
    const kbd = document.createElement("kbd")
    keys.forEach((key) => {
        if (typeof key === "string") {
            kbd.textContent = key
        } else {
            kbd.classList.add("palette-footer__kbd-nav")
            kbd.appendChild(key)
        }
    })
    span.appendChild(kbd)
    span.appendChild(document.createTextNode(label))
    return span
}

let commands: Command[] = []
let filtered: Command[] = []
let active = -1
let open = false

let field: HTMLElement | null = null
let input: HTMLInputElement | null = null
let panel: HTMLElement | null = null
let list: HTMLElement | null = null
let highlight: HTMLElement | null = null
let highlightControls: AnimationPlaybackControls | null = null
let optionEls: HTMLElement[] = []
let emptyMessage = ""

const loadIndex = (): void => {
    const script = document.querySelector<HTMLScriptElement>(INDEX_SELECTOR)
    if (!script?.textContent) return
    try {
        commands = JSON.parse(script.textContent) as Command[]
    } catch {
        commands = []
    }
}

const setInputExpanded = (value: boolean): void => {
    input?.setAttribute("aria-expanded", String(value))
}

const optionLabel = (index: number): string => `palette-option-${index}`

const buildPanel = (): void => {
    panel = document.createElement("div")
    panel.className = PANEL_CLASS

    list = document.createElement("div")
    list.className = "palette-list"
    list.id = "palette-listbox"
    list.setAttribute("role", "listbox")
    panel.appendChild(list)

    highlight = document.createElement("div")
    highlight.className = "palette-highlight"
    highlight.style.opacity = "0"
    list.appendChild(highlight)

    const footer = document.createElement("div")
    footer.className = "palette-footer"
    const group = document.createElement("div")
    group.className = "palette-footer__group"
    group.appendChild(hint([iconElement(ChevronUp), iconElement(ChevronDown)], " navigate"))
    group.appendChild(hint([iconElement(CornerDownLeft)], " open"))
    group.appendChild(hint(["esc"], " close"))
    footer.appendChild(group)
    panel.appendChild(footer)

    field?.appendChild(panel)
}

const renderList = (): void => {
    if (!list || !highlight) return
    optionEls.forEach((element) => element.remove())
    optionEls = []
    list.classList.toggle("is-empty", filtered.length === 0 && !emptyMessage)

    if (filtered.length === 0) {
        highlight.style.opacity = "0"
        if (emptyMessage) {
            const empty = document.createElement("div")
            empty.className = "palette-empty"
            empty.textContent = emptyMessage
            list.appendChild(empty)
        }
        return
    }

    highlight.style.opacity = "0"

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

const fuzzyScore = (haystack: string, needle: string): number => {
    let needleIndex = 0
    let firstIndex = -1
    let run = 0
    let bestRun = 0
    for (let i = 0; i < haystack.length && needleIndex < needle.length; i++) {
        if (haystack[i] === needle[needleIndex]) {
            if (firstIndex < 0) firstIndex = i
            run += 1
            if (run > bestRun) bestRun = run
            needleIndex += 1
        } else {
            run = 0
        }
    }
    if (needleIndex < needle.length) return 0
    return 1 + (bestRun * 2) - (firstIndex * 0.25)
}

const filter = (query: string): void => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    filtered = tokens.length === 0
        ? []
        : commands
            .map((command) => {
                const haystack = `${command.label} ${command.category} ${(command.keywords ?? []).join(" ")}`.toLowerCase()
                let total = 0
                for (const token of tokens) {
                    const score = fuzzyScore(haystack, token)
                    if (score === 0) return null
                    total += score
                }
                return { command, score: total }
            })
            .filter((entry): entry is { command: Command, score: number } => entry !== null)
            .sort((a, b) => b.score - a.score)
            .map((entry) => entry.command)
    active = -1
    emptyMessage = tokens.length === 0 ? "" : "No results"
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
    if (open || !input) return
    open = true
    buildPanel()
    filter(input.value)
    setInputExpanded(true)

    if (!panel) return
    if (reduced()) {
        panel.style.opacity = "1"
        return
    }
    animate(panel, { opacity: [0, 1], transform: ["translateY(-4px)", "translateY(0)"] }, { duration: 0.15, ease: ENTRANCE_EASE })
}

const closePalette = (): void => {
    if (!open) return
    open = false
    highlightControls?.stop()
    highlightControls = null
    setInputExpanded(false)

    const currentPanel = panel
    const teardown = (): void => {
        currentPanel?.remove()
        if (panel === currentPanel) panel = null
        list = null
        highlight = null
        optionEls = []
    }

    if (!currentPanel) {
        teardown()
        return
    }
    if (reduced()) {
        teardown()
        return
    }
    const controls = animate(currentPanel, { opacity: 0, transform: "translateY(-4px)" }, { duration: 0.12, ease: ENTRANCE_EASE })
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

const isInsideField = (node: Node | null): boolean => !!node && !!field && field.contains(node)

const onKeydown = (event: KeyboardEvent): void => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (open) closePalette()
        else {
            input?.focus()
            openPalette()
        }
        return
    }
    if (!open) return
    switch (event.key) {
        case "Escape":
            event.preventDefault()
            closePalette()
            input?.blur()
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

const onFocusIn = (event: FocusEvent): void => {
    if (!open && event.target === input) openPalette()
}

const onInput = (event: Event): void => {
    if (event.target === input && open) filter(input?.value ?? "")
}

const onMousedown = (event: MouseEvent): void => {
    if (open && !isInsideField(event.target instanceof Node ? event.target : null)) closePalette()
}

const onFocusOut = (event: FocusEvent): void => {
    if (open && !isInsideField(event.relatedTarget instanceof Node ? event.relatedTarget : null)) closePalette()
}

const boot = (): void => {
    document.querySelectorAll<HTMLElement>(`.${PANEL_CLASS}`).forEach((element) => element.remove())

    loadIndex()
    field = document.querySelector<HTMLElement>(FIELD_SELECTOR)
    input = field?.querySelector<HTMLInputElement>(INPUT_SELECTOR) ?? null
    open = false
}

if (!windowRef.__paletteBound) {
    windowRef.__paletteBound = true
    document.addEventListener("keydown", onKeydown)
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("input", onInput, true)
    document.addEventListener("mousedown", onMousedown)
    document.addEventListener("focusout", onFocusOut)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true })
    } else {
        boot()
    }
    document.addEventListener("astro:page-load", boot)
}

boot()
