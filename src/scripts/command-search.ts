import type { Command } from "~/lib/search"

const INDEX_SELECTOR = "script[type='application/json'][data-command-index]"

/** Reads the build-time command index embedded as a JSON data island. */
export const readCommandIndex = (): Command[] => {
    const script = document.querySelector<HTMLScriptElement>(INDEX_SELECTOR)
    if (!script?.textContent) return []
    try {
        return JSON.parse(script.textContent) as Command[]
    } catch {
        return []
    }
}

export interface CommandListboxOptions {
    /** Container the options (and optional empty state) are appended to. */
    list: HTMLElement
    /** Builds one option element; the listbox adds ARIA + interaction wiring. */
    renderOption: (command: Command, index: number) => HTMLElement
    /** Optional empty state, shown when there are no results. */
    renderEmpty?: () => HTMLElement | null
    /** Called when an option is activated (click or Enter). */
    onChoose: (command: Command) => void
    /** Called after the active option changes, with its element (or null). */
    onActiveChange?: (command: Command | null, option: HTMLElement | null) => void
}

/**
 * A keyboard-navigable listbox of filtered commands, shared by the desktop
 * command palette and the mobile menu search. It owns the option elements, the
 * active index, and the `role="option"` / `aria-selected` contract; callers own
 * how an option looks (`renderOption`) and what choosing one means (`onChoose`).
 */
export class CommandListbox {
    private readonly list: HTMLElement
    private readonly renderOption: CommandListboxOptions["renderOption"]
    private readonly renderEmpty: CommandListboxOptions["renderEmpty"]
    private readonly onChoose: CommandListboxOptions["onChoose"]
    private readonly onActiveChange: CommandListboxOptions["onActiveChange"]
    private options: HTMLElement[] = []
    private items: Command[] = []
    private emptyEl: HTMLElement | null = null
    private index = -1

    constructor(options: CommandListboxOptions) {
        this.list = options.list
        this.renderOption = options.renderOption
        this.renderEmpty = options.renderEmpty
        this.onChoose = options.onChoose
        this.onActiveChange = options.onActiveChange
    }

    get count(): number {
        return this.items.length
    }

    get active(): number {
        return this.index
    }

    get activeCommand(): Command | null {
        if (this.index < 0) return null
        return this.items[this.index] ?? null
    }

    /** Removes every rendered option and the empty state, resetting the index. */
    clear(): void {
        for (const option of this.options) option.remove()
        this.options = []
        this.emptyEl?.remove()
        this.emptyEl = null
        this.items = []
        this.index = -1
    }

    /** Renders `items` and activates the first option (or the empty state). */
    setItems(items: Command[]): void {
        this.clear()
        this.items = items
        if (items.length === 0) {
            const empty = this.renderEmpty?.()
            if (empty) {
                this.list.appendChild(empty)
                this.emptyEl = empty
            }
            this.notifyActive()
            return
        }
        this.options = items.map((command, index) => {
            const option = this.renderOption(command, index)
            option.setAttribute("role", "option")
            option.setAttribute("aria-selected", "false")
            option.addEventListener("mouseenter", () => this.setActive(index))
            option.addEventListener("click", () => this.choose(command))
            this.list.appendChild(option)
            return option
        })
        this.setActive(0)
    }

    /** Moves the active option to `index`, clamped to the rendered range. */
    setActive(index: number): void {
        if (this.items.length === 0) {
            this.index = -1
            this.notifyActive()
            return
        }
        this.index = Math.max(0, Math.min(index, this.items.length - 1))
        this.options.forEach((option, optionIndex) => {
            const isActive = optionIndex === this.index
            option.classList.toggle("is-active", isActive)
            option.setAttribute("aria-selected", String(isActive))
        })
        this.options[this.index]?.scrollIntoView({ block: "nearest" })
        this.notifyActive()
    }

    /** Moves the active option by `step`, wrapping around the ends. */
    move(step: number): void {
        if (this.items.length === 0) return
        this.setActive((this.index + step + this.items.length) % this.items.length)
    }

    /** Activates the current option, as if it had been clicked. */
    activate(): void {
        const command = this.activeCommand
        if (command) this.choose(command)
    }

    private choose(command: Command): void {
        this.onChoose(command)
    }

    private notifyActive(): void {
        this.onActiveChange?.(this.activeCommand, this.optionAt(this.index))
    }

    private optionAt(index: number): HTMLElement | null {
        if (index < 0) return null
        return this.options[index] ?? null
    }
}
