import { z } from 'zod';
import { safeHref } from '~/lib/types';

export const ProfileSchema = z.object({
    name: z.string(),
    role: z.string(),
    summary: z.string(),
    email: z.email(),
    availability: z.string(),
});

export const ContactLinkSchema = z.object({
    label: z.string(),
    kind: z.enum(['email', 'code', 'profile']),
    href: safeHref,
    detail: z.string(),
    external: z.boolean(),
});

export const CapabilitySchema = z.object({
    label: z.string(),
    title: z.string(),
    description: z.string(),
});

export const ContactSchema = z.object({
    links: z.array(ContactLinkSchema),
});

export const CapabilitiesSchema = z.object({
    capabilities: z.array(CapabilitySchema),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type ContactLink = z.infer<typeof ContactLinkSchema>;
export type Capability = z.infer<typeof CapabilitySchema>;

export function validate<T>(schema: z.ZodSchema<T>, data: unknown, source: string): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues
            .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        throw new Error(`Validation failed for ${source}:\n${issues}`);
    }
    return result.data;
}
