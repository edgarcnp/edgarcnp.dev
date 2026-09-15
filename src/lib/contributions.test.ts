import { describe, expect, test } from "bun:test"
import {
    buildContributionWeeks,
    contributionCountLabel,
    contributionDateLabel,
    contributionLabel,
    contributionMonthLabels,
    contributionSeparatorLabels,
    contributionTotalLabel,
    contributionWeekdayLabels,
    isWeekendRow,
    levelForCount,
    normalizeContributionDays,
    totalContributions,
    utcDay,
} from "./contributions"

const rawDays = [
    { date: "2026-01-01", count: 0 },
    { date: "2026-01-02", count: 1 },
    { date: "2026-01-03", count: 10 },
    { date: "2026-01-04", count: 20 },
    { date: "2026-01-05", count: 40 },
]

describe("utcDay", () => {
    test("reads the date at UTC midnight regardless of host timezone", () => {
        expect(utcDay("2026-01-01").toISOString()).toBe("2026-01-01T00:00:00.000Z")
        expect(utcDay("2026-01-01").getUTCDay()).toBe(4)
    })
})

describe("levelForCount", () => {
    test("reserves level 0 for zero and for an empty series", () => {
        expect(levelForCount(0, 40)).toBe(0)
        expect(levelForCount(0, 0)).toBe(0)
        expect(levelForCount(5, 0)).toBe(0)
    })

    test("grades against quartiles of the busiest day", () => {
        expect(levelForCount(1, 40)).toBe(1)
        expect(levelForCount(10, 40)).toBe(1)
        expect(levelForCount(11, 40)).toBe(2)
        expect(levelForCount(20, 40)).toBe(2)
        expect(levelForCount(21, 40)).toBe(3)
        expect(levelForCount(30, 40)).toBe(3)
        expect(levelForCount(31, 40)).toBe(4)
        expect(levelForCount(40, 40)).toBe(4)
    })

    test("never grades a single contribution above level 1 in a one-day series", () => {
        expect(levelForCount(1, 1)).toBe(4)
    })
})

describe("normalizeContributionDays", () => {
    test("grades and orders a valid payload", () => {
        const days = normalizeContributionDays({ days: rawDays })
        expect(days?.map((day) => day.date)).toEqual([
            "2026-01-01",
            "2026-01-02",
            "2026-01-03",
            "2026-01-04",
            "2026-01-05",
        ])
        expect(days?.map((day) => day.level)).toEqual([0, 1, 1, 2, 4])
    })

    test("rejects payloads that are not a contribution series", () => {
        expect(normalizeContributionDays(null)).toBeNull()
        expect(normalizeContributionDays({})).toBeNull()
        expect(normalizeContributionDays({ days: [] })).toBeNull()
        expect(normalizeContributionDays({ days: [{ date: "01/01/2026", count: 1 }] })).toBeNull()
        expect(normalizeContributionDays({ days: [{ date: "2026-01-01", count: -1 }] })).toBeNull()
        expect(normalizeContributionDays({ days: [{ date: "2026-01-01", count: 1.5 }] })).toBeNull()
        expect(normalizeContributionDays({ days: [{ date: "2026-01-01" }] })).toBeNull()
        expect(normalizeContributionDays({ days: ["2026-01-01"] })).toBeNull()
    })

    test("keeps one entry per date", () => {
        const days = normalizeContributionDays({
            days: [
                { date: "2026-01-01", count: 1 },
                { date: "2026-01-01", count: 9 },
            ],
        })
        expect(days).toHaveLength(1)
        expect(days?.[0].count).toBe(9)
    })
})

describe("buildContributionWeeks", () => {
    test("pads the leading week so every column holds seven slots", () => {
        const days = normalizeContributionDays({ days: rawDays }) ?? []
        const weeks = buildContributionWeeks(days)
        expect(weeks).toHaveLength(2)
        expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null])
        expect(weeks[0][4]?.date).toBe("2026-01-01")
        expect(weeks[1].map((day) => day?.date ?? null)).toEqual([
            "2026-01-04",
            "2026-01-05",
            null,
            null,
            null,
            null,
            null,
        ])
    })

    test("returns nothing for an empty series", () => {
        expect(buildContributionWeeks([])).toEqual([])
    })

    test("rotates the lead padding for a non-Sunday week start", () => {
        // Jan 1 2026 is a Thursday, so a Monday-first grid leads with three blanks.
        const days = normalizeContributionDays({ days: rawDays }) ?? []
        const weeks = buildContributionWeeks(days, 1)
        expect(weeks[0].slice(0, 3)).toEqual([null, null, null])
        expect(weeks[0][3]?.date).toBe("2026-01-01")
        expect(weeks[1][0]?.date).toBe("2026-01-05")
    })
})

describe("contributionMonthLabels", () => {
    test("labels only the column that opens a month", () => {
        const days = normalizeContributionDays({ days: rawDays }) ?? []
        expect(contributionMonthLabels(buildContributionWeeks(days))).toEqual(["Jan", null])
    })

    test("labels consecutive months on the columns that open them", () => {
        // A full week of January leading into the week that opens February.
        const days = normalizeContributionDays({
            days: [
                { date: "2026-01-25", count: 1 },
                { date: "2026-01-26", count: 1 },
                { date: "2026-01-27", count: 1 },
                { date: "2026-01-28", count: 1 },
                { date: "2026-01-29", count: 1 },
                { date: "2026-01-30", count: 1 },
                { date: "2026-01-31", count: 1 },
                { date: "2026-02-01", count: 1 },
            ],
        }) ?? []
        expect(contributionMonthLabels(buildContributionWeeks(days))).toEqual(["Jan", "Feb"])
    })

    test("renders the full or initial month name on request", () => {
        const days = normalizeContributionDays({ days: rawDays }) ?? []
        const weeks = buildContributionWeeks(days)
        expect(contributionMonthLabels(weeks, "full")).toEqual(["January", null])
        expect(contributionMonthLabels(weeks, "initial")).toEqual(["J", null])
    })
})

describe("contributionWeekdayLabels", () => {
    test("leaves blank rows between the labelled weekdays", () => {
        expect(contributionWeekdayLabels()).toEqual([null, "Mon", null, "Wed", null, "Fri", null])
    })

    test("follows the week start and the tick filter", () => {
        expect(contributionWeekdayLabels(1)).toEqual([null, "Tue", null, "Thu", null, "Sat", null])
        expect(contributionWeekdayLabels(0, "all")).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        expect(contributionWeekdayLabels(0, "even")).toEqual(["Sun", null, "Tue", null, "Thu", null, "Sat"])
    })

    test("renders the full or initial weekday name on request", () => {
        expect(contributionWeekdayLabels(0, "all", "full")[1]).toBe("Monday")
        expect(contributionWeekdayLabels(0, "all", "initial")).toEqual(["S", "M", "T", "W", "T", "F", "S"])
    })
})

describe("isWeekendRow", () => {
    test("rotates with the week start", () => {
        expect(isWeekendRow(0, 0)).toBe(true)
        expect(isWeekendRow(0, 6)).toBe(true)
        expect(isWeekendRow(0, 1)).toBe(false)
        expect(isWeekendRow(1, 5)).toBe(true)
        expect(isWeekendRow(1, 6)).toBe(true)
        expect(isWeekendRow(1, 0)).toBe(false)
    })
})

describe("contributionSeparatorLabels", () => {
    const days = normalizeContributionDays({ days: rawDays }) ?? []
    const weeks = buildContributionWeeks(days)

    test("marks every interval column", () => {
        expect(contributionSeparatorLabels(weeks, { groupBy: "every", every: 2 })).toEqual(["", null])
        expect(contributionSeparatorLabels(weeks, { groupBy: "every", every: 1 })).toEqual(["", ""])
    })

    test("marks the column that opens each quarter, labelling it on request", () => {
        // Mar 29 2026 is a Sunday, so the eighth day opens a new week and Q2.
        const quarterly = normalizeContributionDays({
            days: [
                { date: "2026-03-29", count: 1 },
                { date: "2026-03-30", count: 1 },
                { date: "2026-03-31", count: 1 },
                { date: "2026-04-01", count: 1 },
                { date: "2026-04-02", count: 1 },
                { date: "2026-04-03", count: 1 },
                { date: "2026-04-04", count: 1 },
                { date: "2026-04-05", count: 1 },
            ],
        }) ?? []
        const quarterlyWeeks = buildContributionWeeks(quarterly)
        expect(contributionSeparatorLabels(quarterlyWeeks, { groupBy: "quarter" })).toEqual(["", ""])
        expect(contributionSeparatorLabels(quarterlyWeeks, { groupBy: "quarter", showLabels: true }))
            .toEqual(["Q1", "Q2"])
    })
})

describe("labels", () => {
    test("counts contributions, singular included", () => {
        expect(totalContributions(rawDays)).toBe(71)
        expect(contributionTotalLabel(1)).toBe("1 contribution in the last year")
        expect(contributionTotalLabel(1195)).toBe("1,195 contributions in the last year")
    })

    test("describes a day the way GitHub does", () => {
        expect(contributionLabel({ date: "2026-01-01", count: 0 })).toBe("No contributions on January 1, 2026")
        expect(contributionLabel({ date: "2026-01-02", count: 1 })).toBe("1 contribution on January 2, 2026")
        expect(contributionLabel({ date: "2026-01-03", count: 17 })).toBe("17 contributions on January 3, 2026")
    })

    test("splits the count and the date for the heatmap tooltip", () => {
        expect(contributionCountLabel(0)).toBe("No contributions")
        expect(contributionCountLabel(1)).toBe("1 contribution")
        expect(contributionCountLabel(1195)).toBe("1,195 contributions")
        expect(contributionDateLabel("2026-01-03")).toBe("January 3, 2026")
    })
})
