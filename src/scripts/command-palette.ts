import { animate, initPrefersReducedMotion, prefersReducedMotion } from "motion"
import type { AnimationPlaybackControls } from "motion"
import { navigate } from "astro:transitions/client"
import { ChevronDown, ChevronUp, CornerDownLeft, createElement } from "lucide"
import type { IconNode } from "lucide"
import { filterCommands, type Command } from "~/lib/search"
import { CommandListbox, readCommandIndex } from "./command-search"
import { onPageLoad } from "./lifecycle"

initPrefersReducedMotion()

const reduced = (): boolean => prefersReducedMotion.current === true

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
let emptyMessage = ""
let open = false

let field: HTMLElement | null = null
let input: HTMLInputElement | null = null
let panel: HTMLElement | null = null
let list: HTMLElement | null = null
let highlight: HTMLElement | null = null
let highlightControls: AnimationPlaybackControls | null = null
let listbox: CommandListbox | null = null

const setInputExpanded = (value: boolean): void => {
    input?.setAttribute("aria-expanded", String(value))
}

const renderOption = (command: Command, index: number): HTMLElement => {
    const option = document.createElement("button")
    option.type = "button"
    option.className = "palette-option"
    option.id = `palette-option-${index}`
    option.tabIndex = -1

    const label = document.createElement("span")
    label.className = "palette-option__label"
    label.textContent = command.label

    const category = document.createElement("span")
    category.className = "palette-option__category"
    category.textContent = command.category

    option.append(label, category)
    return option
}

const renderEmpty = (): HTMLElement | null => {
    if (!emptyMessage) return null
    const empty = document.createElement("div")
    empty.className = "palette-empty"
    empty.textContent = emptyMessage
    return empty
}

const positionHighlight = (option: HTMLElement | null): void => {
    if (!highlight) return
    if (!option) {
        highlight.style.opacity = "0"
        return
    }
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

    listbox = new CommandListbox({
        list,
        renderOption,
        renderEmpty,
        onChoose: choose,
        onActiveChange: (command, option) => {
            if (input) {
                if (command && option) input.setAttribute("aria-activedescendant", option.id)
                else input.removeAttribute("aria-activedescendant")
            }
            positionHighlight(option)
        },
    })

    field?.appendChild(panel)
}

const filter = (query: string): void => {
    const hasQuery = query.trim().length > 0
    emptyMessage = hasQuery ? "No results" : ""
    const results = filterCommands(commands, query)
    list?.classList.toggle("is-empty", results.length === 0 && !emptyMessage)
    listbox?.setItems(results)
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
        listbox = null
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
            listbox?.move(1)
            break
        case "ArrowUp":
            event.preventDefault()
            listbox?.move(-1)
            break
        case "Home":
            event.preventDefault()
            listbox?.setActive(0)
            break
        case "End":
            event.preventDefault()
            if (listbox) listbox.setActive(listbox.count - 1)
            break
        case "Enter":
            event.preventDefault()
            listbox?.activate()
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

    commands = readCommandIndex()
    field = document.querySelector<HTMLElement>(FIELD_SELECTOR)
    input = field?.querySelector<HTMLInputElement>(INPUT_SELECTOR) ?? null
    listbox = null
    open = false
}

document.addEventListener("keydown", onKeydown)
document.addEventListener("focusin", onFocusIn)
document.addEventListener("input", onInput, true)
document.addEventListener("mousedown", onMousedown)
document.addEventListener("focusout", onFocusOut)

onPageLoad(boot)
