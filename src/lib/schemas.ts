import { z } from "zod"

const ALLOWED_HREF_SCHEMES = ["https:", "http:", "mailto:", "#"]

/**
 * Zod schema for href values. Only allows safe URL schemes.
 *
 * @remarks
 * Allowed schemes:
 * - `https:` — standard HTTPS links
 * - `http:` — standard HTTP links (kept for compatibility)
 * - `mailto:` — email links
 * - `#` — same-page anchor links
 *
 * Everything else (javascript:, data:, ftp:, etc.) is rejected.
 * Uses `new URL()` for parsing — throws on malformed URLs, caught internally.
 */
export const safeHref = z.string().refine(
    (val) => {
        if (val === "#") return true
        try {
            const url = new URL(val)
            return ALLOWED_HREF_SCHEMES.includes(url.protocol)
        } catch {
            return false
        }
    },
    { message: 'href must use https:, http:, mailto:, or be "#"' },
)

/**
 * Zod enum schema for project statuses.
 *
 * @remarks
 * Valid values: `"Planned"`, `"In Progress"`, `"Archived"`.
 * Used in project frontmatter validation and status badge rendering.
 */
export const ProjectStatus = z.enum(["Planned", "In Progress", "Archived"])
export type ProjectStatus = z.infer<typeof ProjectStatus>

/**
 * Zod schema for project link objects (e.g. "Source code", "Live demo").
 *
 * @remarks
 * Fields:
 * - `label`: Display text for the link
 * - `href`: Validated URL via `safeHref`
 * - `external`: Whether to open in new tab
 */
export const ProjectLink = z.object({
    label: z.string(),
    href: safeHref,
    external: z.boolean(),
})
export type ProjectLink = z.infer<typeof ProjectLink>

/**
 * Zod enum schema for contact link type discriminators.
 *
 * @remarks
 * Valid values: `"email"`, `"code"`, `"profile"`.
 * Determines the visual styling and icon for each contact link.
 */
export const ContactKind = z.enum(["email", "code", "profile"])
export type ContactKind = z.infer<typeof ContactKind>
