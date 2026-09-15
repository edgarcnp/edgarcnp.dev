/** Pure helpers behind the GitHub contribution heatmap: validating the upstream
 * series, bucketing counts into GitHub's five intensity levels, and laying the
 * days out in week columns. Client-safe (no `astro:content`). */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const COUNT_FORMATTER = new Intl.NumberFormat("en-US")

const LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" })

export interface RawContributionDay {
    /** Calendar day, `YYYY-MM-DD`, in UTC. */
    date: string
    /** Contributions recorded that day. */
    count: number
}

export interface ContributionDay extends RawContributionDay {
    /** Intensity bucket, 0 (none) to 4 (busiest day in the series). */
    level: number
}

/** One week column, padded with `null` where the range does not reach so every
 * column holds exactly seven slots. */
export type ContributionWeek = (ContributionDay | null)[]

/** Day of the week shown in the grid's first row: 0 = Sunday … 6 = Saturday. */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Pattern presets for `HeatmapLevelStyle.fillMode: "pattern"`. */
export type HeatmapPattern = "diagonal" | "dots" | "grid" | "horizontal" | "vertical"

export interface HeatmapLevelStyle {
    /** Solid fill (the default) or a repeating pattern over the level colour. */
    fillMode?: "solid" | "pattern"
    /** Pattern preset used when `fillMode` is `"pattern"`. Defaults to diagonal. */
    pattern?: HeatmapPattern
}

/** `short` = "Mon"/"Jan", `full` = "Monday"/"January", `initial` = "M"/"J". */
export type HeatmapAxisLabelFormat = "short" | "full" | "initial"

/** Which weekday rows carry a label. */
export type HeatmapTickFilter = "all" | "odd" | "even"

export interface HeatmapSeparatorConfig {
    /** `quarter` groups on calendar quarters, `every` on a fixed column count. */
    groupBy?: "every" | "quarter"
    /** Column interval for `groupBy: "every"`. Defaults to 1. */
    every?: number
    /** Draw Q1–Q4 at the start of each quarter group. */
    showLabels?: boolean
    strokeStyle?: "solid" | "dashed"
    /** Fade the line out towards the top and bottom of the grid. */
    fade?: boolean
}

/** Parses `YYYY-MM-DD` at UTC midnight — local-time parsing would shift the
 * weekday for anyone west of Greenwich. */
export function utcDay(date: string): Date {
    const [year, month, day] = date.split("-").map(Number)
    return new Date(Date.UTC(year, month - 1, day))
}

/** Buckets a count into five levels using quartiles of the busiest day, which
 * is how GitHub grades its own calendar. Level 0 is reserved for zero. */
export function levelForCount(count: number, max: number): number {
    if (count <= 0 || max <= 0) return 0
    return Math.min(Math.max(Math.ceil((count / max) * 4), 1), 4)
}

export function totalContributions(days: RawContributionDay[]): number {
    let total = 0
    for (const day of days) total += day.count
    return total
}

export function contributionTotalLabel(total: number): string {
    const noun = total === 1 ? "contribution" : "contributions"
    return `${COUNT_FORMATTER.format(total)} ${noun} in the last year`
}

/** Count clause on its own, for the tooltip's headline line. */
export function contributionCountLabel(count: number): string {
    if (count === 0) return "No contributions"
    const noun = count === 1 ? "contribution" : "contributions"
    return `${COUNT_FORMATTER.format(count)} ${noun}`
}

/** Long-form calendar day, for the tooltip's secondary line. */
export function contributionDateLabel(date: string): string {
    return LABEL_FORMATTER.format(utcDay(date))
}

export function contributionLabel(day: RawContributionDay): string {
    return `${contributionCountLabel(day.count)} on ${contributionDateLabel(day.date)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function isRawDay(value: unknown): value is RawContributionDay {
    if (!isRecord(value)) return false
    const { date, count } = value
    return (
        typeof date === "string"
        && DATE_PATTERN.test(date)
        && typeof count === "number"
        && Number.isInteger(count)
        && count >= 0
    )
}

/** Validates an upstream payload (`{ days: [{ date, count }] }`) and grades it.
 * Returns null for anything unrecognizable so callers can keep prior data
 * rather than blanking the heatmap on a bad response. */
export function normalizeContributionDays(input: unknown): ContributionDay[] | null {
    if (!isRecord(input)) return null
    const { days } = input
    if (!Array.isArray(days) || days.length === 0) return null

    const parsed: RawContributionDay[] = []
    for (const day of days as unknown[]) {
        if (!isRawDay(day)) return null
        parsed.push(day)
    }

    const unique = new Map(parsed.map((day) => [day.date, day]))
    const ordered = [...unique.values()].sort((a, b) => a.date.localeCompare(b.date))
    const max = ordered.reduce((peak, day) => Math.max(peak, day.count), 0)
    return ordered.map((day) => ({ ...day, level: levelForCount(day.count, max) }))
}

/** Fills week columns with seven slots each. The lead padding is rotated so the
 * requested weekday lands in the top row — the source series stays Sunday-first
 * and only the display rotates. */
export function buildContributionWeeks(days: ContributionDay[], weekStartDay: WeekStartDay = 0): ContributionWeek[] {
    if (days.length === 0) return []

    const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date))
    const lead = (utcDay(ordered[0].date).getUTCDay() - weekStartDay + 7) % 7
    const slots: ContributionWeek = [...Array.from({ length: lead }, () => null), ...ordered]
    while (slots.length % 7 !== 0) slots.push(null)

    const weeks: ContributionWeek[] = []
    for (let index = 0; index < slots.length; index += 7) {
        weeks.push(slots.slice(index, index + 7))
    }
    return weeks
}

function monthLabel(month: number, format: HeatmapAxisLabelFormat): string {
    if (format === "full") return MONTH_NAMES[month]
    if (format === "initial") return MONTH_NAMES[month].charAt(0)
    return MONTH_LABELS[month]
}

function weekdayLabel(day: number, format: HeatmapAxisLabelFormat): string {
    if (format === "full") return WEEKDAY_NAMES[day]
    if (format === "initial") return WEEKDAY_NAMES[day].charAt(0)
    return WEEKDAY_LABELS[day]
}

/** Month label for each week column that opens a new month, else null. The
 * labels share the grid's column sizing, so they stay aligned with it. */
export function contributionMonthLabels(
    weeks: ContributionWeek[],
    format: HeatmapAxisLabelFormat = "short",
): (string | null)[] {
    let previousMonth = -1
    return weeks.map((week) => {
        const first = week.find((day): day is ContributionDay => day !== null)
        if (!first) return null
        const month = utcDay(first.date).getUTCMonth()
        if (month === previousMonth) return null
        previousMonth = month
        return monthLabel(month, format)
    })
}

/** Weekday label for each grid row (the row after `weekStartDay` rotation), or
 * null on rows the tick filter leaves unlabelled so the remaining names keep
 * their grid rows. */
export function contributionWeekdayLabels(
    weekStartDay: WeekStartDay = 0,
    tickFilter: HeatmapTickFilter = "odd",
    format: HeatmapAxisLabelFormat = "short",
): (string | null)[] {
    return Array.from({ length: 7 }, (_, row) => {
        if (tickFilter === "odd" && row % 2 === 0) return null
        if (tickFilter === "even" && row % 2 === 1) return null
        return weekdayLabel((weekStartDay + row) % 7, format)
    })
}

/** Whether a display row lands on Saturday or Sunday after the rotation. */
export function isWeekendRow(weekStartDay: WeekStartDay, row: number): boolean {
    const day = (weekStartDay + row) % 7
    return day === 0 || day === 6
}

/** For each week column, the label of the group it opens: an empty string for
 * an unlabelled separator, null where no separator is drawn. */
export function contributionSeparatorLabels(
    weeks: ContributionWeek[],
    config: HeatmapSeparatorConfig = {},
): (string | null)[] {
    if (config.groupBy === "quarter") {
        let previousQuarter = -1
        return weeks.map((week) => {
            const first = week.find((day): day is ContributionDay => day !== null)
            if (!first) return null
            const quarter = Math.floor(utcDay(first.date).getUTCMonth() / 3)
            if (quarter === previousQuarter) return null
            previousQuarter = quarter
            return config.showLabels ? `Q${quarter + 1}` : ""
        })
    }

    const step = Math.max(1, Math.trunc(config.every ?? 1))
    return weeks.map((_, index) => (index % step === 0 ? "" : null))
}
