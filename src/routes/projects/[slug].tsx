import { Show, Suspense } from "solid-js";
import { useParams, createAsync, cache } from "@solidjs/router";
import { getProject } from "~/lib/server-content";
import type { Project } from "~/lib/content";
import TechTag from "~/components/shared/TechTag";
import StatusBadge from "~/components/shared/StatusBadge";
import { LinkAction } from "~/components/ui/static/LinkAction";

const fetchProject = cache(async (slug: string) => getProject(slug) as Project | undefined, "project");

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
                {p().technologies.map((tech: string) => (
                  <li><TechTag label={tech} /></li>
                ))}
              </ul>
              <Show when={p().links.length > 0}>
                <div class="flex flex-wrap gap-3">
                  {p().links.map((link: { label: string; href: string; external: boolean }) => (
                    <LinkAction href={link.href} external={link.external} variant="secondary">{link.label}</LinkAction>
                  ))}
                </div>
              </Show>
            </header>
            <div class="markdown-body" innerHTML={p().body} />
          </article>
        )}
      </Show>
    </Suspense>
  );
}
