import { describe, expect, test } from "bun:test"
import { formatDate } from "./format"

describe("formatDate", () => {
    test("renders a long US date", () => {
        expect(formatDate(new Date(2026, 5, 12))).toBe("June 12, 2026")
    })
})
