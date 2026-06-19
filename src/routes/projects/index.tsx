import { For, Suspense } from "solid-js";
import { createAsync, query } from "@solidjs/router";
import { getProjects } from "~/lib/server-content";
import SectionHeading from "~/components/shared/SectionHeading";
import ProjectCard from "~/components/shared/ProjectCard";

const fetchProjects = query(async () => await getProjects(), "projects");

export default function Projects() {
  const projects = createAsync(() => fetchProjects());
  const total = () => projects()?.length ?? 0;
  const inProgress = () => projects()?.filter((p) => p.status === "In Progress").length ?? 0;
  const planned = () => projects()?.filter((p) => p.status === "Planned").length ?? 0;

  const stats = () => [
    { label: "Total", value: total() },
    { label: "In Progress", value: inProgress() },
    { label: "Planned", value: planned() },
  ];

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
