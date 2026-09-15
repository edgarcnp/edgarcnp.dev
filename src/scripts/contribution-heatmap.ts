import { contributionCountLabel, contributionDateLabel } from "../lib/contributions"
import { onPageLoad } from "./lifecycle"

/** Progressive enhancement for the server-rendered heatmap: staggers the cell
 * entrance animation and swaps each cell's native `title` for a styled tooltip.
 * The markup ships the snapshot and the browser's own tooltips, so nothing here
 * is required for the heatmap to render or make sense. */

const ROOT_SELECTOR = ".heatmap"
const DAY_SELECTOR = "[data-date]"
const COLUMN_STAGGER_MS = 10
const TOOLTIP_GAP = 8
const DEFAULT_HIDE_DELAY = 120

function showTooltip(root: HTMLElement, grid: HTMLElement, cell: HTMLElement): void {
    const tooltip = root.querySelector<HTMLElement>(".heatmap__tooltip")
    const date = cell.dataset.date ?? ""
    if (!tooltip || date === "") return

    const dateNode = tooltip.querySelector<HTMLElement>(".heatmap__tooltip-date")
    const countNode = tooltip.querySelector<HTMLElement>(".heatmap__tooltip-count")
    if (dateNode) dateNode.textContent = contributionDateLabel(date)
    if (countNode) countNode.textContent = contributionCountLabel(Number(cell.dataset.count ?? "0"))

    tooltip.dataset.open = ""

    const rootRect = root.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    const cellRect = cell.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const half = tooltipRect.width / 2
    const center = cellRect.left - rootRect.left + (cellRect.width / 2)
    // Flipping against the grid (not the card) keeps the tooltip off the
    // heading when the top row is hovered.
    const below = cellRect.top - gridRect.top - TOOLTIP_GAP - tooltipRect.height < 0

    tooltip.classList.toggle("is-below", below)
    tooltip.style.left = `${Math.min(Math.max(center, half + 4), rootRect.width - half - 4)}px`
    tooltip.style.top = `${(below ? cellRect.bottom : cellRect.top) - rootRect.top}px`
}

function enhance(root: HTMLElement): void {
    const grid = root.querySelector<HTMLElement>(".heatmap__grid")
    const tooltip = root.querySelector<HTMLElement>(".heatmap__tooltip")
    if (!grid || !tooltip) return

    const showDelay = Number(root.dataset.tooltipShowDelay ?? "0")
    const hideDelay = Number(root.dataset.tooltipHideDelay ?? `${DEFAULT_HIDE_DELAY}`)
    let showTimer = 0
    let hideTimer = 0

    root.querySelectorAll<HTMLElement>(".heatmap__week").forEach((week, index) => {
        week.style.setProperty("--heatmap-delay", `${index * COLUMN_STAGGER_MS}ms`)
    })

    const hide = (): void => {
        window.clearTimeout(showTimer)
        window.clearTimeout(hideTimer)
        tooltip.removeAttribute("data-open")
        tooltip.classList.remove("is-below")
    }

    // Leaving a cell waits out the grace period, so crossing the gaps between
    // adjacent cells does not flicker the tooltip.
    const hideSoon = (): void => {
        window.clearTimeout(showTimer)
        window.clearTimeout(hideTimer)
        hideTimer = window.setTimeout(hide, hideDelay)
    }

    const show = (cell: HTMLElement): void => {
        window.clearTimeout(hideTimer)
        if (tooltip.hasAttribute("data-open")) {
            showTooltip(root, grid, cell)
            return
        }
        window.clearTimeout(showTimer)
        showTimer = window.setTimeout(() => showTooltip(root, grid, cell), showDelay)
    }

    grid.addEventListener("pointerover", (event) => {
        const target = event.target
        const cell = target instanceof Element ? target.closest<HTMLElement>(DAY_SELECTOR) : null
        if (!cell || !grid.contains(cell)) {
            hideSoon()
            return
        }
        cell.removeAttribute("title")
        show(cell)
    })
    grid.addEventListener("pointerleave", hideSoon)
    root.querySelector<HTMLElement>(".heatmap__scroll")?.addEventListener("scroll", hide, { passive: true })
}

onPageLoad(() => {
    document.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach(enhance)
})
