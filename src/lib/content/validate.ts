import path from "node:path"

import { IoError, ValidationError } from "../errors"

/** Absolute path to the src/content/ directory. */
export const CONTENT_DIR = path.join(process.cwd(), "src", "content")

/**
 * Validate that a path stays within the content directory.
 *
 * Normalizes via `path.resolve` then checks the result starts with CONTENT_DIR.
 *
 * @param filePath - Absolute or relative path to validate.
 * @returns The normalized absolute path.
 * @throws {IoError} If the path escapes the content directory.
 */
export function assertWithinContentDir(filePath: string): string {
    const normalized = path.resolve(CONTENT_DIR, filePath)
    if (!normalized.startsWith(CONTENT_DIR + path.sep) && normalized !== CONTENT_DIR) {
        throw new IoError("resolve content path", filePath)
    }
    return normalized
}

/**
 * Validate a slug contains only safe characters (alphanumeric, hyphens, underscores).
 *
 * @param slug - The slug to validate.
 * @throws {ValidationError} If the slug contains invalid characters.
 */
export function assertValidSlug(slug: string): void {
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
export function assertValidSubdir(subdir: string): void {
    if (!/^[a-zA-Z0-9_-]+$/.test(subdir)) {
        throw new ValidationError("subdir", `Invalid subdir: "${subdir}"`, [{ path: "subdir", message: "must contain only alphanumeric characters, hyphens, or underscores" }])
    }
}
