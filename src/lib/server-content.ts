"use server";

/**
 * Server-side data access layer.
 *
 * "use server" makes every export an RPC callable from client components via createAsync().
 * This file is the only place that imports both content.ts (file I/O) and data/schemas.ts (JSON validation).
 * All functions are async to match the SolidStart RPC contract.
 *
 * @remarks
 * - Client components import from this file, never directly from content.ts or data/schemas.ts.
 * - The SolidStart compiler transforms these into HTTP requests at build time.
 * - Errors thrown here propagate to the client-side ErrorBoundary.
 */

import capabilitiesRaw from "~/data/capabilities.json";
import contactRaw from "~/data/contact.json";
import profileRaw from "~/data/profile.json";
import { validate, ProfileSchema, ContactSchema, CapabilitiesSchema } from "~/data/schemas";

import { getProjects as _getProjects, getProject as _getProject, getWriting as _getWriting, getWritingPost as _getWritingPost } from "~/lib/content";

import type { Profile, ContactLink, Capability } from "~/data/schemas";

/**
 * Validate and return capability cards from src/data/capabilities.json.
 *
 * @returns Promise resolving to `{ capabilities: Capability[] }`.
 *
 * @throws {ValidationError} If capabilities.json fails CapabilitiesSchema validation.
 */
export async function getCapabilities(): Promise<{ capabilities: Capability[] }> {
  return validate(CapabilitiesSchema, capabilitiesRaw, "capabilities.json");
}

/**
 * Validate and return contact links from src/data/contact.json.
 *
 * @returns Promise resolving to `{ links: ContactLink[] }`.
 *
 * @throws {ValidationError} If contact.json fails ContactSchema validation.
 */
export async function getContact(): Promise<{ links: ContactLink[] }> {
  return validate(ContactSchema, contactRaw, "contact.json");
}

/**
 * Find a project by slug, parsing body on demand.
 *
 * @param slug - URL-friendly project identifier.
 * @returns Promise resolving to the matching Project with body, or undefined.
 *
 * @throws {IoError|ValidationError|ParseError} Propagated from content.ts.
 */
export async function getProject(slug: string) { return _getProject(slug); }

/**
 * Load all projects (frontmatter only, no body parsing).
 *
 * @returns Promise resolving to an array of ProjectMeta sorted by year descending.
 *
 * @throws {IoError|ValidationError} Propagated from content.ts.
 *
 * @remarks Body is NOT parsed — use getProject(slug) for that.
 */
export async function getProjects() { return _getProjects(); }

/**
 * Validate and return profile data from src/data/profile.json.
 *
 * @returns Promise resolving to a validated Profile object.
 *
 * @throws {ValidationError} If profile.json fails ProfileSchema validation.
 *
 * @remarks
 * Validates at request time — a malformed JSON file will throw on every request.
 * No caching — JSON is small and validation is fast.
 */
export async function getProfile(): Promise<Profile> {
  return validate(ProfileSchema, profileRaw, "profile.json");
}

/**
 * Load all writing posts (frontmatter only, no body parsing).
 *
 * @returns Promise resolving to an array of WritingMeta sorted by date descending.
 *
 * @throws {IoError|ValidationError|DateError} Propagated from content.ts.
 *
 * @remarks Body is NOT parsed — use getWritingPost(slug) for that.
 */
export async function getWriting() { return _getWriting(); }

/**
 * Find a writing post by slug, parsing body on demand.
 *
 * @param slug - URL-friendly post identifier.
 * @returns Promise resolving to the matching WritingPost with body, or undefined.
 *
 * @throws {IoError|ValidationError|ParseError|DateError} Propagated from content.ts.
 */
export async function getWritingPost(slug: string) { return _getWritingPost(slug); }
