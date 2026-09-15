/** Build-time source for the contribution calendar. GitHub exposes no
 * read-only JSON for a user's contributions, so this reads the public
 * contributions page, where each day cell carries its date and its count sits
 * in a matching `<tool-tip>`. Never shipped to the browser: only the scheduled
 * snapshot script (`scripts/sync-contributions.ts`) calls it. */

import { normalizeContributionDays, type ContributionDay } from "./contributions"

const CELL_PATTERN
    = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*?id="(contribution-day-component-[^"]+)"[^>]*?data-level="(\d)"/g

const TOOLTIP_PATTERN = /<tool-tip[^>]*?for="(contribution-day-component-[^"]+)"[^>]*>([^<]*)<\/tool-tip>/g

const COUNT_PATTERN = /^(\d+)\s+contribution(?:s)?\b/

/** GitHub localizes the tooltip prose, so pin the language it answers in. */
const REQUEST_HEADERS = { accept: "text/html", "accept-language": "en-US,en;q=0.9" }

function readCount(tooltip: string): number {
    const match = COUNT_PATTERN.exec(tooltip.trim())
    return match ? Number(match[1]) : 0
}

function contributionsUrl(user: string): string {
    return `https://github.com/users/${encodeURIComponent(user)}/contributions`
}

/** Reads the calendar out of GitHub's markup. Throws rather than returning an
 * empty or zeroed series when the page no longer looks like a contributions
 * calendar, so a markup change surfaces instead of quietly rendering an empty
 * heatmap. */
export function parseContributionsHtml(html: string): ContributionDay[] {
    const counts = new Map<string, number>()
    for (const match of html.matchAll(TOOLTIP_PATTERN)) {
        counts.set(match[1], readCount(match[2]))
    }

    const days: { date: string, count: number }[] = []
    let markedActive = false
    for (const match of html.matchAll(CELL_PATTERN)) {
        if (match[3] !== "0") markedActive = true
        days.push({ date: match[1], count: counts.get(match[2]) ?? 0 })
    }

    if (days.length === 0) throw new Error("GitHub contributions markup contained no day cells")
    if (counts.size === 0) throw new Error("GitHub contributions markup contained no contribution counts")
    if (markedActive && days.every((day) => day.count === 0)) {
        throw new Error("GitHub contributions markup reported activity but no readable counts")
    }

    const normalized = normalizeContributionDays({ days })
    if (!normalized) throw new Error("GitHub contributions markup produced an invalid series")
    return normalized
}

export async function fetchGithubContributions(user: string, init?: RequestInit): Promise<ContributionDay[]> {
    const response = await fetch(contributionsUrl(user), { ...init, headers: REQUEST_HEADERS })
    if (!response.ok) throw new Error(`GitHub contributions request failed with ${response.status}`)
    return parseContributionsHtml(await response.text())
}
