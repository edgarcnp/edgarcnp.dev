import { getCollection, type CollectionEntry } from "astro:content"

export type Project = CollectionEntry<"projects">
export type WritingPost = CollectionEntry<"writing">
export type ProjectStatus = Project["data"]["status"]

export interface ProjectStats {
    total: number
    inProgress: number
    planned: number
}

export function sortByPublished<T extends { data: { published: Date } }>(entries: T[]): T[] {
    return [...entries].sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
}

export async function getProjects(): Promise<Project[]> {
    return sortByPublished(await getCollection("projects"))
}

export async function getFeaturedProjects(): Promise<Project[]> {
    const projects = await getProjects()
    return projects.filter((project) => project.data.featured)
}

export async function getProjectStats(): Promise<ProjectStats> {
    const projects = await getCollection("projects")
    let inProgress = 0
    let planned = 0
    for (const project of projects) {
        if (project.data.status === "In Progress") inProgress++
        else if (project.data.status === "Planned") planned++
    }
    return { total: projects.length, inProgress, planned }
}

export async function getWritingPosts(): Promise<WritingPost[]> {
    return sortByPublished(await getCollection("writing"))
}
