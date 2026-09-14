import { describe, expect, test } from "bun:test"
import { filterCommands, fuzzyScore, type Command } from "./search"

const index: Command[] = [
    { id: "nav:projects", label: "Projects", href: "/projects", category: "Nav", keywords: [] },
    {
        id: "project:secure-portfolio-platform",
        label: "Secure Portfolio Platform",
        href: "/projects/secure-portfolio-platform",
        category: "Projects",
        keywords: ["Astro", "Cloudflare", "A portfolio built with Astro"],
    },
    {
        id: "writing:secure-portfolio-foundation",
        label: "Building a Secure Portfolio Foundation",
        href: "/writing/secure-portfolio-foundation",
        category: "Writing",
        keywords: ["Astro", "Security"],
    },
]

describe("fuzzyScore", () => {
    test("exact prefix scores higher than a later start", () => {
        expect(fuzzyScore("projects nav", "pro")).toBeGreaterThan(fuzzyScore("approve nav", "pro"))
    })

    test("rewards matches that start earlier", () => {
        expect(fuzzyScore("portfolio", "por")).toBeGreaterThan(fuzzyScore("xsupport", "por"))
    })

    test("returns 0 for non-subsequences", () => {
        expect(fuzzyScore("projects", "zqx")).toBe(0)
        expect(fuzzyScore("pro", "projects")).toBe(0)
    })
})

describe("filterCommands", () => {
    test("empty query matches nothing", () => {
        expect(filterCommands(index, "")).toEqual([])
        expect(filterCommands(index, "   ")).toEqual([])
    })

    test("tokens combine with AND semantics", () => {
        const results = filterCommands(index, "secure astro")
        expect(results.map((command) => command.id).sort()).toEqual([
            "project:secure-portfolio-platform",
            "writing:secure-portfolio-foundation",
        ])
    })

    test("matches against label, category, and keywords", () => {
        expect(filterCommands(index, "cloudflare")).toHaveLength(1)
        expect(filterCommands(index, "writing")[0]?.id).toBe("writing:secure-portfolio-foundation")
        expect(filterCommands(index, "secure portfolio")[0]?.id).toBe("project:secure-portfolio-platform")
    })

    test("is case-insensitive", () => {
        expect(filterCommands(index, "SECURE")).toHaveLength(2)
    })
})
