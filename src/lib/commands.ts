import { navIndex } from "~/config/site"
import { getProjects, getWritingPosts } from "~/lib/content"

import type { Command } from "~/lib/search"

export async function buildCommandIndex(): Promise<Command[]> {
    const projects = await getProjects()
    const posts = await getWritingPosts()
    return [
        ...navIndex.map((link) => ({
            id: `nav:${link.label.toLowerCase()}`,
            label: link.label,
            href: link.href,
            category: "Nav",
            keywords: [] as string[],
        })),
        ...projects.map((entry) => ({
            id: `project:${entry.id}`,
            label: entry.data.title,
            href: `/projects/${entry.id}`,
            category: "Projects",
            keywords: [...entry.data.technologies, entry.data.summary],
        })),
        ...posts.map((entry) => ({
            id: `writing:${entry.id}`,
            label: entry.data.title,
            href: `/writing/${entry.id}`,
            category: "Writing",
            keywords: [...entry.data.tags, entry.data.summary],
        })),
    ]
}
