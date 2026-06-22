import { z } from "zod"

import { DateError } from "../errors"
import { safeHref } from "../schemas"
import { readBody, readMarkdownFiles, parseFrontmatter } from "./read"

const projectSchema = z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
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
    slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
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
 * Find a single project by slug, parsing body on demand.
 *
 * @param slug - URL-friendly identifier from the project's frontmatter.
 * @returns The matching project with body, or undefined if not found.
 */
export async function getProject(slug: string): Promise<Project | undefined> {
    const projects = await getProjects()
    const meta = projects.find((p) => p.slug === slug)
    if (!meta) return undefined
    const body = await readBody("projects", meta.slug)
    return { ...meta, body }
}

/**
 * Load all projects (frontmatter only, no body parsing).
 *
 * @returns Array of project frontmatter, sorted by year descending.
 *
 * @remarks Cached after first call.
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
 */
export async function getWritingPost(slug: string): Promise<WritingPost | undefined> {
    const posts = await getWriting()
    const meta = posts.find((p) => p.slug === slug)
    if (!meta) return undefined
    const body = await readBody("writing", meta.slug)
    return { ...meta, body }
}

/**
 * Load all writing posts (frontmatter only, no body parsing).
 *
 * @returns Array of post frontmatter, sorted by published date descending.
 *
 * @remarks Cached after first call.
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
