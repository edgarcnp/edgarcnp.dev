import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { parseHTML } from 'linkedom/worker';
import createDOMPurify from 'dompurify';
import { z } from 'zod';
import { safeHref } from './schemas';
import { ValidationError, IoError, ParseError, DateError } from './errors';

const marked = new Marked({ gfm: true, breaks: false });

const { window } = parseHTML('<html><body></body></html>');
const DOMPurify = createDOMPurify(window as any);

/**
 * Parse markdown to HTML and sanitize with DOMPurify.
 *
 * @param content - Raw markdown string from the file body.
 * @param source  - File path for error context.
 * @returns Sanitized HTML string.
 *
 * @throws {ParseError} If marked.parse() throws or DOMPurify returns empty output.
 *
 * @remarks
 * Pipeline: markdown → marked.parse() (GFM enabled, breaks disabled) → DOMPurify sanitize.
 * DOMPurify config: allows standard HTML tags, strips data attributes, restricts to safe attributes.
 * Empty sanitized output is treated as an error (defensive).
 */
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

/**
 * Zod schema for project markdown frontmatter.
 *
 * @remarks
 * Required fields: title, slug, summary, year, published, updated, status, technologies.
 * Optional fields with defaults: featured (false), pinned (false), links ([]).
 * Status is constrained to: "Planned" | "In Progress" | "Archived".
 * Link hrefs are validated by `safeHref`.
 */
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

/**
 * Zod schema for writing markdown frontmatter.
 *
 * @remarks
 * Required fields: title, slug, summary, published, updated.
 * Optional fields with defaults: tags ([]).
 */
const writingSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  published: z.string(),
  updated: z.string(),
  tags: z.array(z.string()).default([]),
});

/**
 * Parsed project with rendered HTML body.
 *
 * @remarks Extends the Zod-inferred frontmatter type with a `body` field containing sanitized HTML.
 */
export type Project = z.infer<typeof projectSchema> & { body: string };

/**
 * Parsed writing post with rendered HTML body.
 *
 * @remarks Extends the Zod-inferred frontmatter type with a `body` field containing sanitized HTML.
 */
export type WritingPost = z.infer<typeof writingSchema> & { body: string };

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

/**
 * Read all .md file paths from a content subdirectory.
 *
 * @param subdir - Subdirectory name under src/content/ (e.g. "projects", "writing").
 * @returns Array of absolute file paths to .md files.
 *
 * @throws {IoError} If readdir fails after the directory is confirmed to exist.
 *
 * @remarks
 * Returns empty array if the directory doesn't exist (no error).
 * Filters to .md files only.
 * TOCTOU race possible: directory could be deleted between access check and readdir.
 */
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

/**
 * Parse a date string, throwing DateError if invalid.
 *
 * @param value  - Date string to parse (e.g. "2024-03-15").
 * @param source - Context identifier for error messages.
 * @returns Parsed Date object.
 *
 * @throws {DateError} If `new Date(value).getTime()` returns NaN.
 *
 * @remarks Detects invalid dates that Zod's `z.string()` doesn't catch.
 */
function parseDate(value: string, source: string): Date {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    throw new DateError(value, source);
  }
  return new Date(value);
}

/**
 * Read a markdown file, validate frontmatter, sanitize body.
 *
 * @param filePath - Absolute path to the .md file.
 * @param schema   - Zod schema to validate frontmatter against.
 * @returns Parsed data with rendered HTML body.
 *
 * @throws {IoError}       If fs.readFile fails.
 * @throws {ValidationError} If frontmatter fails schema validation.
 * @throws {ParseError}     If markdown parsing or sanitization fails.
 *
 * @remarks
 * Pipeline: read file → gray-matter parse → Zod validate frontmatter → marked + DOMPurify body.
 * Each step has explicit error handling — no raw throws leak out.
 */
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

let projectsCache: Project[] | null = null;
let writingCache: WritingPost[] | null = null;

/**
 * Load all projects from src/content/projects/.
 *
 * @returns Array of parsed projects, sorted by year descending.
 *
 * @throws {IoError}       If directory reading or file reading fails.
 * @throws {ValidationError} If any project's frontmatter fails validation.
 * @throws {ParseError}     If any markdown body fails parsing/sanitization.
 *
 * @remarks
 * Cached after first call — subsequent calls return the cached array.
 * A single bad .md file will throw and break the entire load (no partial results).
 * Sorting is by `year` field descending (newest first).
 */
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

/**
 * Find a single project by slug.
 *
 * @param slug - URL-friendly identifier from the project's frontmatter.
 * @returns The matching project, or undefined if not found.
 *
 * @throws {IoError}       If loading all projects fails.
 * @throws {ValidationError} If project frontmatter is invalid.
 * @throws {ParseError}     If markdown parsing fails.
 *
 * @remarks Delegates to `getProjects()` which caches results.
 */
export async function getProject(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug);
}

/**
 * Load all writing posts from src/content/writing/.
 *
 * @returns Array of parsed posts, sorted by published date descending (newest first).
 *
 * @throws {IoError}       If directory reading or file reading fails.
 * @throws {ValidationError} If any post's frontmatter fails validation.
 * @throws {ParseError}     If any markdown body fails parsing/sanitization.
 * @throws {DateError}      If any published date is unparseable.
 *
 * @remarks
 * Cached after first call — subsequent calls return the cached array.
 * A single bad .md file will throw and break the entire load.
 * Sorting uses `new Date(published).getTime()` — invalid dates throw DateError.
 */
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

/**
 * Find a single writing post by slug.
 *
 * @param slug - URL-friendly identifier from the post's frontmatter.
 * @returns The matching post, or undefined if not found.
 *
 * @throws {IoError}       If loading all posts fails.
 * @throws {ValidationError} If post frontmatter is invalid.
 * @throws {ParseError}     If markdown parsing fails.
 * @throws {DateError}      If any published date is unparseable.
 *
 * @remarks Delegates to `getWriting()` which caches results.
 */
export async function getWritingPost(slug: string): Promise<WritingPost | undefined> {
  const posts = await getWriting();
  return posts.find((p) => p.slug === slug);
}
