import { For, Show, Suspense } from "solid-js";
import { useParams, createAsync, query } from "@solidjs/router";
import { getProject } from "~/lib/server-content";
import { sanitize } from "~/lib/trusted-types";
import { TechTag } from "~/components/shared/TechTag";
import { StatusBadge } from "~/components/shared/StatusBadge";
import { LinkAction } from "~/components/ui/static/LinkAction";

/** Cached query: single project by slug. */
const fetchProject = query(async (slug: string) => getProject(slug), "project");

/**
 * Single project detail page — header, metadata, tech tags, links, and rendered markdown body.
 *
 * @remarks
 * - Uses `useParams()` to get the slug from the URL.
 * - Fetches project data via `"use server"` RPC.
 * - Displays "Project not found" fallback if slug doesn't match any project.
 * - Shows published/updated dates, status badge, technology tags, and external links.
 * - Renders the markdown body as sanitized HTML via `innerHTML`.
 * - Uses `<For>` for efficient list rendering of tags and links.
 */
export default function ProjectPost() {
  const params = useParams<{ slug: string }>();
  const project = createAsync(() => fetchProject(params.slug));

  return (
    <Suspense fallback={<div class="blueprint-label">Loading project...</div>}>
      <Show
        when={project()}
        fallback={
          <section class="blueprint-frame max-w-2xl space-y-5 p-5 sm:p-6">
            <h1 class="text-3xl font-semibold text-(--blueprint-text)">Project not found</h1>
            <LinkAction href="/projects" variant="secondary">Back to projects</LinkAction>
          </section>
        }
      >
        {(p) => (
          <article class="mx-auto max-w-3xl space-y-8">
            <header class="blueprint-frame space-y-5 p-5 sm:p-6">
              <LinkAction href="/projects" variant="secondary">Back to projects</LinkAction>
              <div class="space-y-3">
                <div class="blueprint-label flex flex-wrap gap-x-4 gap-y-1">
                  <span class="whitespace-nowrap">Published {p().published}</span>
                  <span class="whitespace-nowrap">Updated {p().updated}</span>
                </div>
                <div class="flex items-start justify-between gap-4">
                  <h1 class="text-3xl font-semibold text-(--blueprint-text) sm:text-4xl">{p().title}</h1>
                  <StatusBadge status={p().status} />
                </div>
                <p class="text-base leading-7 text-(--blueprint-muted)">{p().summary}</p>
              </div>
              <ul class="flex flex-wrap gap-2">
                <For each={p().technologies}>
                  {(tech) => (
                    <li><TechTag label={tech} /></li>
                  )}
                </For>
              </ul>
              <Show when={p().links.length > 0}>
                <div class="flex flex-wrap gap-3">
                  <For each={p().links}>
                    {(link) => (
                      <LinkAction href={link.href} external={link.external} variant="secondary">{link.label}</LinkAction>
                    )}
                  </For>
                </div>
              </Show>
            </header>
            <div class="markdown-body" innerHTML={sanitize(p().body)} />
          </article>
        )}
      </Show>
    </Suspense>
  );
}
