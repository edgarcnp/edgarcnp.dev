import { getCollection, getEntry, type CollectionEntry } from "astro:content"

export type Project = CollectionEntry<"projects">
export type WritingPost = CollectionEntry<"writing">

export function sortByPublished<T extends { data: { published: Date } }>(entries: T[]): T[] {
    return [...entries].sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
}

export async function getProjects(): Promise<Project[]> {
    return sortByPublished(await getCollection("projects"))
}

export async function getWritingPosts(): Promise<WritingPost[]> {
    return sortByPublished(await getCollection("writing"))
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
    return getEntry("projects", slug)
}

export async function getWritingPostBySlug(slug: string): Promise<WritingPost | undefined> {
    return getEntry("writing", slug)
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
}
