import { describe, expect, test } from "bun:test"
import { parseContributionsHtml } from "./github-contributions"

/** Trimmed to the shape that matters: date, id, level on the cell, and the
 * prose count in the tooltip that references it. */
const SAMPLE = `
<td data-date="2026-01-01" id="contribution-day-component-0-0" data-level="0" role="gridcell" class="ContributionCalendar-day"></td>
<td data-date="2026-01-08" id="contribution-day-component-0-1" data-level="2" role="gridcell" class="ContributionCalendar-day"></td>
<td data-date="2026-01-15" id="contribution-day-component-0-2" data-level="4" role="gridcell" class="ContributionCalendar-day"></td>
<tool-tip id="a" for="contribution-day-component-0-0" popover="manual" class="sr-only">No contributions on January 1st.</tool-tip>
<tool-tip id="b" for="contribution-day-component-0-1" popover="manual" class="sr-only">17 contributions on January 8th.</tool-tip>
<tool-tip id="c" for="contribution-day-component-0-2" popover="manual" class="sr-only">1 contribution on January 15th.</tool-tip>
<tool-tip id="d" for="contribution-legend-1" popover="manual" class="sr-only">2 contributions</tool-tip>
`

describe("parseContributionsHtml", () => {
    test("reads each day's date, count, and level", () => {
        expect(parseContributionsHtml(SAMPLE)).toEqual([
            { date: "2026-01-01", count: 0, level: 0 },
            { date: "2026-01-08", count: 17, level: 4 },
            { date: "2026-01-15", count: 1, level: 1 },
        ])
    })

    test("treats a day with no matching tooltip as zero", () => {
        const html = SAMPLE.replace(/<tool-tip id="a"[^>]*>[^<]*<\/tool-tip>/, "")
        expect(parseContributionsHtml(html)[0].count).toBe(0)
    })

    test("ignores tooltips that belong to something other than a day cell", () => {
        const html = SAMPLE.replace('for="contribution-day-component-0-2"', 'for="contribution-legend-1"')
        expect(parseContributionsHtml(html)[2]).toEqual({ date: "2026-01-15", count: 0, level: 0 })
    })

    test("throws when the page carries no day cells", () => {
        expect(() => parseContributionsHtml("<p>Not a calendar</p>")).toThrow("no day cells")
    })

    test("throws when the counts cannot be read from the tooltips", () => {
        const html = SAMPLE.replace(/<tool-tip[^>]*>[^<]*<\/tool-tip>/g, "")
        expect(() => parseContributionsHtml(html)).toThrow("no contribution counts")
    })

    test("throws when the tooltips stop naming their counts", () => {
        const html = SAMPLE.replace(/>[^<]*<\/tool-tip>/g, ">No contributions were recorded.</tool-tip>")
        expect(() => parseContributionsHtml(html)).toThrow("no readable counts")
    })
})
