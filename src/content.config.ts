import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const ALLOWED_HREF_SCHEMES = ["https:", "http:", "mailto:", "#"]

const safeHref = z.string().refine(
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

const projectSchema = z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    summary: z.string(),
    year: z.number(),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    status: z.enum(["Planned", "In Progress", "Archived"]),
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    links: z
        .array(
            z.object({
                label: z.string(),
                href: safeHref,
                external: z.boolean(),
            }),
        )
        .default([]),
})

const writingSchema = z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    summary: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    tags: z.array(z.string()).default([]),
})

const projects = defineCollection({
    loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
    schema: projectSchema,
})

const writing = defineCollection({
    loader: glob({ base: "./src/content/writing", pattern: "**/*.md" }),
    schema: writingSchema,
})

const profileSchema = z.object({
    name: z.string(),
    role: z.string(),
    summary: z.string(),
    email: z.email(),
    availability: z.string(),
})

const contactSchema = z.object({
    links: z.array(
        z.object({
            label: z.string(),
            kind: z.enum(["email", "code"]),
            href: safeHref,
            detail: z.string(),
            external: z.boolean(),
        }),
    ),
})

const capabilitiesSchema = z.object({
    capabilities: z.array(
        z.object({
            label: z.string(),
            title: z.string(),
            description: z.string(),
        }),
    ),
})

const data = defineCollection({
    loader: glob({ base: "./src/data", pattern: "**/*.json" }),
    schema: z.union([profileSchema, contactSchema, capabilitiesSchema]),
})

export const collections = { projects, writing, data }
