import createDOMPurify from "dompurify"
import { parseHTML } from "linkedom/worker"
import { Marked } from "marked"

import { ParseError } from "../errors"

const DOMPurify = createDOMPurify(parseHTML("<html><body></body></html>").window)
const marked = new Marked({ gfm: true, breaks: false })

/**
 * Parse markdown to HTML and sanitize with DOMPurify.
 *
 * @param content - Raw markdown string from the file body.
 * @param source  - File path for error context.
 * @returns Sanitized HTML string.
 *
 * @throws {ParseError} If marked.parse() throws or DOMPurify returns empty output.
 */
export function sanitizeMarkdown(content: string, source: string): string {
    let raw: string
    try {
        const result = marked.parse(content)
        if (typeof result !== "string") {
            throw new ParseError(source, "Unexpected async markdown render — all extensions must be synchronous")
        }
        raw = result
    } catch (e) {
        if (e instanceof ParseError) throw e
        throw new ParseError(source, `Markdown parse failed: ${e instanceof Error ? e.message : String(e)}`, e instanceof Error ? e : undefined)
    }

    const sanitized = DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: [
            "h1", "h2", "h3", "h4", "h5", "h6",
            "p", "br", "hr",
            "ul", "ol", "li",
            "blockquote", "pre", "code",
            "a", "img",
            "strong", "em", "del", "mark",
            "table", "thead", "tbody", "tr", "th", "td",
            "dl", "dt", "dd",
            "figure", "figcaption",
            "sup", "sub",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "width", "height"],
        ALLOW_DATA_ATTR: false,
    })

    if (!sanitized || sanitized.trim().length === 0) {
        throw new ParseError(source, "Sanitized output is empty — input may be malformed")
    }

    return sanitized
}
