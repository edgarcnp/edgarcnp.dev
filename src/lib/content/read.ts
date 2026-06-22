import matter from "gray-matter"
import fs from "node:fs/promises"
import path from "node:path"
import { z } from "zod"

import { IoError, ValidationError } from "../errors"
import { CONTENT_DIR, assertWithinContentDir, assertValidSlug, assertValidSubdir } from "./validate"
import { sanitizeMarkdown } from "./sanitize"

/**
 * Validate subdir + slug, resolve to an absolute path, and confirm containment.
 *
 * @param subdir - Content subdirectory (e.g. "projects", "writing").
 * @param slug   - URL-friendly filename slug.
 * @returns Normalized absolute path guaranteed to be inside CONTENT_DIR.
 * @throws {ValidationError} If subdir or slug contain invalid characters.
 * @throws {IoError}         If the resolved path escapes CONTENT_DIR.
 */
function resolveContentPath(subdir: string, slug: string): string {
    assertValidSubdir(subdir)
    assertValidSlug(slug)
    return assertWithinContentDir(path.join(CONTENT_DIR, subdir, `${slug}.md`))
}

/**
 * Read and validate frontmatter from a markdown file (no body parsing).
 *
 * @param filePath - Absolute path to the .md file.
 * @param schema   - Zod schema to validate frontmatter against.
 * @returns Validated frontmatter data.
 *
 * @throws {IoError}         If fs.readFile fails.
 * @throws {ValidationError} If frontmatter fails schema validation.
 */
export async function parseFrontmatter<T extends z.ZodType>(
    filePath: string,
    schema: T,
): Promise<z.infer<T>> {
    const safePath = assertWithinContentDir(filePath)
    let raw: string
    try {
        raw = await fs.readFile(safePath, "utf-8")
    } catch (e) {
        throw new IoError("read file", safePath, e instanceof Error ? e : undefined)
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
 * @throws {IoError}    If file reading fails.
 * @throws {ParseError} If markdown parsing or sanitization fails.
 */
export async function readBody(subdir: string, slug: string): Promise<string> {
    const filePath = resolveContentPath(subdir, slug)
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
export async function readMarkdownFiles(subdir: string): Promise<string[]> {
    assertValidSubdir(subdir)
    const dir = assertWithinContentDir(path.join(CONTENT_DIR, subdir))
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

    return entries.filter((f) => f.endsWith(".md")).map((f) => assertWithinContentDir(path.join(dir, f)))
}
