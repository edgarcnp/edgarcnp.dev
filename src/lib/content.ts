import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import { safeHref } from './schemas';
import { ValidationError, IoError, ParseError, DateError } from './errors';

const marked = new Marked({ gfm: true, breaks: false });

function sanitizeMarkdown(content: string, source: string): string {
  let html: string;
  try {
    html = marked.parse(content) as string;
  } catch (e) {
    throw new ParseError(source, `Markdown parse failed: ${e instanceof Error ? e.message : String(e)}`, e instanceof Error ? e : undefined);
  }

  const sanitized = DOMPurify.sanitize(html, {
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

  if (!sanitized || sanitized.trim().length === 0) {
    throw new ParseError(source, "Sanitized output is empty — input may be malformed");
  }

  return sanitized;
}

// --- Schemas ---

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

async function readMarkdownFiles(subdir: string): Promise<string[]> {
  const dir = path.join(CONTENT_DIR, subdir);
  try {
    await fs.access(dir);
  } catch {
    return [];
  }

  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (e) {
    throw new IoError("read directory", dir, e instanceof Error ? e : undefined);
  }

  return entries.filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f));
}

function parseDate(value: string, source: string): Date {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    throw new DateError(value, source);
  }
  return new Date(value);
}

async function parseMarkdown<T extends z.ZodTypeAny>(
  filePath: string,
  schema: T,
): Promise<z.infer<T> & { body: string }> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf-8');
  } catch (e) {
    throw new IoError("read file", filePath, e instanceof Error ? e : undefined);
  }

  const { data, content } = matter(raw);

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    throw new ValidationError(
      filePath,
      issues.map((i) => `${i.path}: ${i.message}`).join("; "),
      issues,
    );
  }

  const body = sanitizeMarkdown(content, filePath);

  return { ...(parsed.data as Record<string, unknown>), body } as z.infer<T> & { body: string };
}

// --- Content loaders ---

let projectsCache: Project[] | null = null;
let writingCache: WritingPost[] | null = null;

export async function getProjects(): Promise<Project[]> {
  if (projectsCache) return projectsCache;

  const files = await readMarkdownFiles('projects');
  const projects: Project[] = [];

  for (const f of files) {
    const project = await parseMarkdown(f, projectSchema);
    projects.push(project);
  }

  projectsCache = projects.sort((a, b) => b.year - a.year);
  return projectsCache;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug);
}

export async function getWriting(): Promise<WritingPost[]> {
  if (writingCache) return writingCache;

  const files = await readMarkdownFiles('writing');
  const posts: WritingPost[] = [];

  for (const f of files) {
    const post = await parseMarkdown(f, writingSchema);
    posts.push(post);
  }

  writingCache = posts.sort((a, b) => {
    const aTime = parseDate(a.published, `writing/${a.slug}.published`).getTime();
    const bTime = parseDate(b.published, `writing/${b.slug}.published`).getTime();
    return bTime - aTime;
  });

  return writingCache;
}

export async function getWritingPost(slug: string): Promise<WritingPost | undefined> {
  const posts = await getWriting();
  return posts.find((p) => p.slug === slug);
}
