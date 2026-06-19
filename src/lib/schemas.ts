import { z } from 'zod';

const ALLOWED_HREF_SCHEMES = ['https:', 'http:', 'mailto:', '#'];

export const safeHref = z.string().refine(
  (val) => {
    if (val === '#') return true;
    try {
      const url = new URL(val);
      return ALLOWED_HREF_SCHEMES.includes(url.protocol);
    } catch {
      return false;
    }
  },
  { message: 'href must use https:, http:, mailto:, or be "#"' },
);

export const ProjectStatus = z.enum(['Planned', 'In Progress', 'Archived']);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const ProjectLink = z.object({
  label: z.string(),
  href: safeHref,
  external: z.boolean(),
});
export type ProjectLink = z.infer<typeof ProjectLink>;

export const ContactKind = z.enum(['email', 'code', 'profile']);
export type ContactKind = z.infer<typeof ContactKind>;
