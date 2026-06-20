import { createAsync, query } from "@solidjs/router";
import { For, Suspense } from "solid-js";

import { ProjectCard } from "~/components/shared/ProjectCard";
import { SectionHeading } from "~/components/shared/SectionHeading";
import { getProjects } from "~/lib/server-content";

/** Cached query: all projects sorted by year. */
const fetchProjects = query(async () => await getProjects(), "projects");

/**
 * Project listing page — displays stats cards and a full project grid.
 *
 * @remarks
 * - Fetches all projects via `"use server"` RPC.
 * - Computes stats in a single pass (total, in-progress, planned).
 * - Each project rendered as a `ProjectCard` linking to the detail page.
 * - Projects displayed in a 2-column grid on medium screens.
 */
export default function Projects() {
  const projects = createAsync(() => fetchProjects());
  const stats = () => {
    const p = projects() ?? [];
    let inProgress = 0, planned = 0;
    for (const proj of p) {
      if (proj.status === "In Progress") inProgress++;
      else if (proj.status === "Planned") planned++;
    }
    return [
      { label: "Total", value: p.length },
      { label: "In Progress", value: inProgress },
      { label: "Planned", value: planned },
    ];
  };

  return (
    <div class="space-y-8">
      <SectionHeading
        label="Projects"
        title="All projects"
        description="A complete list of projects, sorted by year."
      />

      <Suspense fallback={<div class="blueprint-label">Loading projects...</div>}>
        <div class="grid gap-4 sm:grid-cols-3">
          <For each={stats()}>
            {({ label, value }) => (
              <div class="blueprint-module p-5">
                <p class="blueprint-label">{label}</p>
                <p class="mt-2 text-3xl font-semibold text-(--blueprint-text)">{value}</p>
              </div>
            )}
          </For>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <For each={projects() ?? []}>
            {(p) => (
              <ProjectCard
                title={p.title}
                href={`/projects/${p.slug}`}
                summary={p.summary}
                year={p.year}
                status={p.status}
                technologies={p.technologies}
                pinned={p.pinned}
              />
            )}
          </For>
        </div>
      </Suspense>
    </div>
  );
}
