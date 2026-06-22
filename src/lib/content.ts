import createDOMPurify from "dompurify"
import matter from "gray-matter"
import fs from "node:fs/promises"
import path from "node:path"

import { parseHTML } from "linkedom/worker"
import { Marked } from "marked"
import { z } from "zod"

import { ValidationError, IoError, ParseError, DateError } from "./errors"
import { safeHref } from "./schemas"

const CONTENT_DIR = path.join(process.cwd(), "src", "content")
const DOMPurify = createDOMPurify(parseHTML("<html><body></body></html>").window)
const marked = new Marked({ gfm: true, breaks: false })

/**
 * Validate that a resolved path stays within the content directory.
 *
 * @param resolvedPath - The fully resolved absolute path.
 * @throws {IoError} If the path escapes the content directory.
 */
function assertWithinContentDir(resolvedPath: string): void {
    const relative = path.relative(CONTENT_DIR, resolvedPath)
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new IoError("resolve content path", resolvedPath)
    }
}

/**
 * Validate a slug contains only safe characters (alphanumeric, hyphens, underscores).
 *
 * @param slug - The slug to validate.
 * @throws {ValidationError} If the slug contains invalid characters.
 */
function assertValidSlug(slug: string): void {
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        throw new ValidationError("slug", `Invalid slug: "${slug}"`, [{ path: "slug", message: "must contain only alphanumeric characters, hyphens, or underscores" }])
    }
}

/**
 * Validate a subdirectory name contains only safe characters.
 *
 * @param subdir - The subdirectory name to validate.
 * @throws {ValidationError} If the subdirectory name contains invalid characters.
 */
function assertValidSubdir(subdir: string): void {
    if (!/^[a-zA-Z0-9_-]+$/.test(subdir)) {
        throw new ValidationError("subdir", `Invalid subdir: "${subdir}"`, [{ path: "subdir", message: "must contain only alphanumeric characters, hyphens, or underscores" }])
    }
}
const projectSchema = z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    year: z.number(),
    published: z.string(),
    updated: z.string(),
    status: z.enum(["Planned", "In Progress", "Archived"]),
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    links: z.array(z.object({
        label: z.string(),
        href: safeHref,
        external: z.boolean(),
    })).default([]),
})
let projectsCache: ProjectMeta[] | null = null
const writingSchema = z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    published: z.string(),
    updated: z.string(),
    tags: z.array(z.string()).default([]),
})
let writingCache: WritingMeta[] | null = null

/** Frontmatter-only project shape used by list views. */
export type ProjectMeta = z.infer<typeof projectSchema>

/** Full project with rendered HTML body, used by detail pages. */
export type Project = ProjectMeta & { body: string }

/** Frontmatter-only writing post shape used by list views. */
export type WritingMeta = z.infer<typeof writingSchema>

/** Full writing post with rendered HTML body, used by detail pages. */
export type WritingPost = WritingMeta & { body: string }

/**
 * Find a single project by slug, parsing body on demand.
 *
 * @param slug - URL-friendly identifier from the project's frontmatter.
 * @returns The matching project with body, or undefined if not found.
 *
 * @remarks Reads frontmatter from cache, then parses the file body on demand.
 */
export async function getProject(slug: string): Promise<Project | undefined> {
    const projects = await getProjects()
    const meta = projects.find((p) => p.slug === slug)
    if (!meta) return undefined
    const body = await readBody("projects", slug)
    return { ...meta, body }
}

/**
 * Load all projects (frontmatter only, no body parsing).
 *
 * @returns Array of project frontmatter, sorted by year descending.
 *
 * @remarks
 * Cached after first call. Body is NOT parsed — use getProject(slug) for that.
 * Sorting is by `year` field descending (newest first).
 */
export async function getProjects(): Promise<ProjectMeta[]> {
    if (projectsCache) return projectsCache

    const files = await readMarkdownFiles("projects")
    const projects: ProjectMeta[] = []

    for (const f of files) {
        const meta = await parseFrontmatter(f, projectSchema)
        projects.push(meta)
    }

    projectsCache = projects.sort((a, b) => b.year - a.year)
    return projectsCache
}

/**
 * Find a single writing post by slug, parsing body on demand.
 *
 * @param slug - URL-friendly identifier from the post's frontmatter.
 * @returns The matching post with body, or undefined if not found.
 *
 * @remarks Reads frontmatter from cache, then parses the file body on demand.
 */
export async function getWritingPost(slug: string): Promise<WritingPost | undefined> {
    const posts = await getWriting()
    const meta = posts.find((p) => p.slug === slug)
    if (!meta) return undefined
    const body = await readBody("writing", slug)
    return { ...meta, body }
}

/**
 * Load all writing posts (frontmatter only, no body parsing).
 *
 * @returns Array of post frontmatter, sorted by published date descending.
 *
 * @remarks
 * Cached after first call. Body is NOT parsed — use getWritingPost(slug) for that.
 * Sorting uses `new Date(published).getTime()` — invalid dates throw DateError.
 */
export async function getWriting(): Promise<WritingMeta[]> {
    if (writingCache) return writingCache

    const files = await readMarkdownFiles("writing")
    const posts: WritingMeta[] = []

    for (const f of files) {
        const meta = await parseFrontmatter(f, writingSchema)
        posts.push(meta)
    }

    writingCache = posts.sort((a, b) => {
        const aTime = parseDate(a.published, `writing/${a.slug}.published`).getTime()
        const bTime = parseDate(b.published, `writing/${b.slug}.published`).getTime()
        return bTime - aTime
    })

    return writingCache
}

/**
 * Parse a date string, throwing DateError if invalid.
 *
 * @param value  - Date string to parse (e.g. "2024-03-15").
 * @param source - Context identifier for error messages.
 * @returns Parsed Date object.
 *
 * @throws {DateError} If `new Date(value).getTime()` returns NaN.
 */
function parseDate(value: string, source: string): Date {
    const timestamp = new Date(value).getTime()
    if (Number.isNaN(timestamp)) {
        throw new DateError(value, source)
    }
    return new Date(value)
}

/**
 * Read and validate frontmatter from a markdown file (no body parsing).
 *
 * @param filePath - Absolute path to the .md file.
 * @param schema   - Zod schema to validate frontmatter against.
 * @returns Validated frontmatter data.
 *
 * @throws {IoError}       If fs.readFile fails.
 * @throws {ValidationError} If frontmatter fails schema validation.
 */
async function parseFrontmatter<T extends z.ZodType>(
    filePath: string,
    schema: T,
): Promise<z.infer<T>> {
    let raw: string
    try {
        raw = await fs.readFile(filePath, "utf-8")
    } catch (e) {
        throw new IoError("read file", filePath, e instanceof Error ? e : undefined)
    }

    const { data } = matter(raw)

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
        }))
        throw new ValidationError(
            filePath,
            issues.map((i) => `${i.path}: ${i.message}`).join("; "),
            issues,
        )
    }

    return parsed.data
}

/**
 * Read a single markdown file's body, parse and sanitize it.
 *
 * @param subdir - Content subdirectory (e.g. "projects", "writing").
 * @param slug   - URL-friendly slug to find the file.
 * @returns Sanitized HTML body.
 *
 * @throws {IoError}       If file reading fails.
 * @throws {ParseError}    If markdown parsing or sanitization fails.
 */
async function readBody(subdir: string, slug: string): Promise<string> {
    assertValidSubdir(subdir)
    assertValidSlug(slug)
    const filePath = path.resolve(CONTENT_DIR, subdir, `${slug}.md`)
    assertWithinContentDir(filePath)
    let raw: string
    try {
        raw = await fs.readFile(filePath, "utf-8")
    } catch (e) {
        throw new IoError("read file", filePath, e instanceof Error ? e : undefined)
    }

    const { content } = matter(raw)
    return sanitizeMarkdown(content, filePath)
}

/**
 * Read all .md file paths from a content subdirectory.
 *
 * @param subdir - Subdirectory name under src/content/ (e.g. "projects", "writing").
 * @returns Array of absolute file paths to .md files.
 *
 * @throws {IoError} If readdir fails after the directory is confirmed to exist.
 *
 * @remarks Returns empty array if the directory doesn't exist (no error).
 */
async function readMarkdownFiles(subdir: string): Promise<string[]> {
    assertValidSubdir(subdir)
    const dir = path.join(CONTENT_DIR, subdir)
    try {
        await fs.access(dir)
    } catch {
        return []
    }

    let entries: string[]
    try {
        entries = await fs.readdir(dir)
    } catch (e) {
        throw new IoError("read directory", dir, e instanceof Error ? e : undefined)
    }

    return entries.filter((f) => f.endsWith(".md")).map((f) => path.join(dir, f))
}

/**
 * Parse markdown to HTML and sanitize with DOMPurify.
 *
 * @param content - Raw markdown string from the file body.
 * @param source  - File path for error context.
 * @returns Sanitized HTML string.
 *
 * @throws {ParseError} If marked.parse() throws or DOMPurify returns empty output.
 */
function sanitizeMarkdown(content: string, source: string): string {
    let html: string
    try {
        html = marked.parse(content) as string
    } catch (e) {
        throw new ParseError(source, `Markdown parse failed: ${e instanceof Error ? e.message : String(e)}`, e instanceof Error ? e : undefined)
    }

    const sanitized = DOMPurify.sanitize(html, {
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
