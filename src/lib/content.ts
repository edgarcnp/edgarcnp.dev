import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import { safeHref } from './types';

const marked = new Marked({ gfm: true, breaks: false });

function sanitizeMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'strong', 'em', 'del', 'mark',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'dl', 'dt', 'dd',
      'figure', 'figcaption',
      'sup', 'sub',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });
}

// --- Schemas (ported from Astro content.config.ts) ---

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
    href: safeHref,
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

export type Project = z.infer<typeof projectSchema> & { body: string };
export type WritingPost = z.infer<typeof writingSchema> & { body: string };

// --- File helpers ---

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

function readMarkdownFiles(subdir: string): string[] {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function parseMarkdown<T extends z.ZodTypeAny>(
  filePath: string,
  schema: T,
): z.infer<T> & { body: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const parsed = schema.parse(data);
  const body = sanitizeMarkdown(content);
  return { ...(parsed as Record<string, unknown>), body } as z.infer<T> & { body: string };
}

// --- Content loaders ---

export function getProjects(): Project[] {
  return readMarkdownFiles('projects')
    .map((f) => parseMarkdown(f, projectSchema))
    .sort((a, b) => b.year - a.year);
}

export function getProject(slug: string): Project | undefined {
  const files = readMarkdownFiles('projects');
  const file = files.find((f) => {
    const raw = fs.readFileSync(f, 'utf-8');
    const { data } = matter(raw);
    return data.slug === slug;
  });
  if (!file) return undefined;
  return parseMarkdown(file, projectSchema);
}

export function getWriting(): WritingPost[] {
  return readMarkdownFiles('writing')
    .map((f) => parseMarkdown(f, writingSchema))
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

export function getWritingPost(slug: string): WritingPost | undefined {
  const files = readMarkdownFiles('writing');
  const file = files.find((f) => {
    const raw = fs.readFileSync(f, 'utf-8');
    const { data } = matter(raw);
    return data.slug === slug;
  });
  if (!file) return undefined;
  return parseMarkdown(file, writingSchema);
}
