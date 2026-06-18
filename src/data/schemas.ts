import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  summary: z.string(),
  email: z.string().email(),
  availability: z.string(),
});

export const ContactLinkSchema = z.object({
  label: z.string(),
  kind: z.enum(['email', 'code', 'profile']),
  href: z.string(),
  detail: z.string(),
  external: z.boolean(),
});

export const CapabilitySchema = z.object({
  label: z.string(),
  title: z.string(),
  description: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type ContactLink = z.infer<typeof ContactLinkSchema>;
export type Capability = z.infer<typeof CapabilitySchema>;
