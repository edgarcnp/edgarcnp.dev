import { createAsync, query } from "@solidjs/router";
import { For, Suspense } from "solid-js";

import { BlueprintFrame } from "~/components/shared/BlueprintFrame";
import { Grid4 } from "~/components/shared/Grid4";
import { LinkAction } from "~/components/ui/static/LinkAction";
import { ProjectCard } from "~/components/shared/ProjectCard";
import { SectionHeading } from "~/components/shared/SectionHeading";
import { getProjects, getWriting, getProfile, getContact, getCapabilities } from "~/lib/server-content";

import type { Profile, ContactLink, Capability } from "~/data/schemas";
import type { Project } from "~/lib/content";
import type { WritingPost } from "~/lib/content";

/** Cached query: featured projects only (used by hero section). */
const fetchFeaturedProjects = query(async () => (await getProjects()).filter((p) => p.featured), "featuredProjects");
/** Cached query: latest 3 writing posts (used by home page). */
const fetchLatestWriting = query(async () => (await getWriting()).slice(0, 3), "latestWriting");

/**
 * Home page — hero section, featured projects, capabilities grid, writing preview, and contact CTA.
 *
 * @remarks
 * - Fetches profile, contact, capabilities, and featured projects in parallel via `createAsync`.
 * - Hero section displays name, role, availability, and a blueprint diagram placeholder.
 * - Featured projects filtered by `pinned` property, displayed in a 2-column grid.
 * - Capabilities rendered via the `Grid4` component.
 * - Writing and Contact sections displayed side-by-side on desktop.
 * - All data fetched via `"use server"` RPC functions.
 */
export default function Home() {
  const profile = createAsync(() => getProfile());
  const contact = createAsync(() => getContact());
  const capabilities = createAsync(() => getCapabilities());
  const featuredProjects = createAsync(() => fetchFeaturedProjects());
  const codeberg = () => contact()?.links.find((l: ContactLink) => l.label === "Codeberg");

  const stats = () => [
    { label: "Runtime", value: "Cloudflare Workers" },
    { label: "Interface", value: profile()?.role },
    { label: "Availability", value: profile()?.availability },
  ];

  const breakpoints = [
    { label: "Mobile", range: "<640px", active: true },
    { label: "Tablet", range: "640-1024px" },
    { label: "Desktop", range: ">1024px" },
  ];

  return (
    <div class="space-y-16">
      {/* Hero */}
      <section class="section-motion grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div class="space-y-8">
          <div class="space-y-5">
            <p class="blueprint-label">Secure web systems / Responsive UI</p>
            <div class="space-y-4">
              <h1 class="max-w-3xl text-4xl font-semibold tracking-normal text-(--blueprint-text) sm:text-5xl lg:text-6xl">{profile()?.name}</h1>
              <p class="max-w-2xl text-lg leading-8 text-(--blueprint-muted) sm:text-xl">{profile()?.summary}</p>
            </div>
          </div>

          <BlueprintFrame class="p-5">
            <dl class="grid gap-4 sm:grid-cols-3">
              <For each={stats()}>
                {({ label, value }) => (
                  <div>
                    <dt class="blueprint-label text-[0.68rem]">{label}</dt>
                    <dd class="mt-1 text-sm text-(--blueprint-text)">{value}</dd>
                  </div>
                )}
              </For>
            </dl>
          </BlueprintFrame>

          <div class="flex flex-col gap-3 sm:flex-row">
            <LinkAction href="/projects" variant="primary">View projects</LinkAction>
            <LinkAction href="/contact" variant="secondary">Contact</LinkAction>
          </div>
        </div>

        <div class="space-y-4">
          <BlueprintFrame class="aspect-4/3 p-5">
            <div class="flex h-full items-center justify-center">
              <span class="blueprint-label">Blueprint diagram</span>
            </div>
          </BlueprintFrame>
          <div class="blueprint-frame grid grid-cols-3 gap-1 p-1">
            <For each={breakpoints}>
              {({ label, range, active }) => (
                <div class={`flex min-h-13 flex-col items-center justify-center gap-1 border-r border-(--blueprint-line-muted) px-3 py-3 last:border-r-0 ${active ? "text-(--blueprint-accent-2)" : ""}`}>
                  <span class={`text-xs font-bold uppercase tracking-wide ${active ? "text-(--blueprint-accent-2)" : "text-(--blueprint-subtle)"}`}>{label}</span>
                  <span class="text-xs text-(--blueprint-subtle)">{range}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section class="section-motion motion-delay-1 space-y-6">
        <SectionHeading
          label="Selected Work"
          title="Secure content, responsive UI, and edge deployment."
          description="A short list of projects focused on making this portfolio fast, auditable, and stable across devices."
        />
        <Suspense fallback={<div class="blueprint-label">Loading projects...</div>}>
          <div class="grid gap-4 md:grid-cols-2">
            <For each={featuredProjects() ?? []}>
              {(p: Project) => (
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
      </section>

      <Suspense>
        <Grid4 items={capabilities()?.capabilities ?? []} />
      </Suspense>

      {/* Writing + Contact */}
      <section class="section-motion motion-delay-2 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <BlueprintFrame class="p-5">
          <SectionHeading
            label="Writing"
            title="Notes from the build."
            description="Short technical writing about security, responsive UI, and Cloudflare deployment."
          />
        </BlueprintFrame>

        <BlueprintFrame class="flex flex-col justify-between gap-6 p-5">
          <div class="space-y-3">
            <p class="blueprint-label">Contact Endpoint</p>
            <h2 class="text-2xl font-semibold text-(--blueprint-text)">Static links, no message collection.</h2>
            <p class="text-sm leading-6 text-(--blueprint-muted)">{profile()?.summary}</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkAction href="/contact" variant="secondary">Open contact</LinkAction>
            <LinkAction href={`mailto:${profile()?.email}`} variant="accent">{profile()?.email}</LinkAction>
            {codeberg() && (
              <LinkAction href={codeberg()!.href} external={codeberg()!.external} variant="warm-secondary">{codeberg()!.label}</LinkAction>
            )}
          </div>
        </BlueprintFrame>
      </section>
    </div>
  );
}
