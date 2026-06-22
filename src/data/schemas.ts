import { z } from "zod"

import { ValidationError } from "~/lib/errors"
import { safeHref } from "~/lib/schemas"

/**
 * Schema for profile.json — personal info displayed on the home page.
 *
 * @remarks
 * Fields:
 * - `name`: Full name (displayed as hero heading)
 * - `role`: Job title (e.g. "Software Engineer")
 * - `summary`: One-line bio
 * - `email`: Valid email address (validated by `z.email()`)
 * - `availability`: Current availability status text
 */
export const ProfileSchema = z.object({
    name: z.string(),
    role: z.string(),
    summary: z.string(),
    email: z.email(),
    availability: z.string(),
})

/**
 * Schema for a single contact link entry in contact.json.
 *
 * @remarks
 * Fields:
 * - `label`: Display text (e.g. "GitHub", "Email")
 * - `kind`: Type discriminator — "email" | "code" | "profile"
 * - `href`: URL validated by `safeHref`
 * - `detail`: Description text shown below the label
 * - `external`: Whether to open in new tab
 */
export const ContactLinkSchema = z.object({
    label: z.string(),
    kind: z.enum(["email", "code", "profile"]),
    href: safeHref,
    detail: z.string(),
    external: z.boolean(),
})

/**
 * Schema for a capability card in capabilities.json.
 *
 * @remarks
 * Fields:
 * - `label`: Short category label (e.g. "Security")
 * - `title`: Card heading
 * - `description`: Card body text
 */
export const CapabilitySchema = z.object({
    label: z.string(),
    title: z.string(),
    description: z.string(),
})

/**
 * Schema for contact.json — wraps an array of ContactLinkSchema.
 */
export const ContactSchema = z.object({
    links: z.array(ContactLinkSchema),
})

/**
 * Schema for capabilities.json — wraps an array of CapabilitySchema.
 */
export const CapabilitiesSchema = z.object({
    capabilities: z.array(CapabilitySchema),
})

export type Profile = z.infer<typeof ProfileSchema>
export type ContactLink = z.infer<typeof ContactLinkSchema>
export type Capability = z.infer<typeof CapabilitySchema>

/**
 * Validate unknown data against a Zod schema, throwing ValidationError on failure.
 *
 * @param schema - Zod schema to validate against.
 * @param data   - Unknown data to validate (typically parsed JSON).
 * @param source - Identifier for the data source (used in error messages).
 * @returns The validated and typed data.
 *
 * @throws {ValidationError} If validation fails. Contains field-level issues array.
 *
 * @remarks
 * Uses `safeParse` internally — never throws raw Zod errors.
 * Converts Zod issues into our typed `ValidationError` with path + message pairs.
 * Used by `server-content.ts` to validate JSON data files at request time.
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown, source: string): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        const issues = result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
        }))
        throw new ValidationError(
            source,
            issues.map((i) => `${i.path}: ${i.message}`).join("; "),
            issues,
        )
    }
    return result.data
}
