import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const projectSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  year: z.number(),
  published: z.string(),
  updated: z.string(),
  status: z.enum(['Planned', 'In Progress', 'Archived']),
  technologies: z.array(z.string()),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  links: z.array(z.object({
    label: z.string(),
    href: z.string(),
    external: z.boolean(),
  })).default([]),
});

const writingSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  published: z.string(),
  updated: z.string(),
  tags: z.array(z.string()).default([]),
});

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: projectSchema,
  }),
  writing: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
    schema: writingSchema,
  }),
};
