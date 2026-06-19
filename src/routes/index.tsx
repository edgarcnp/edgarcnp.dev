import { For, Suspense } from "solid-js";
import { createAsync } from "@solidjs/router";
import { validate, ProfileSchema, ContactSchema, CapabilitiesSchema } from "~/data/schemas";
import profileRaw from "~/data/profile.json";
import contactRaw from "~/data/contact.json";
import capabilitiesRaw from "~/data/capabilities.json";
import { getProjects, getWriting } from "~/lib/server-content";
import BlueprintFrame from "~/components/shared/BlueprintFrame";
import SectionHeading from "~/components/shared/SectionHeading";
import ProjectCard from "~/components/shared/ProjectCard";
import Grid4 from "~/components/shared/Grid4";
import { LinkAction } from "~/components/ui/static/LinkAction";

const profile = validate(ProfileSchema, profileRaw, "profile.json");
const contact = validate(ContactSchema, contactRaw, "contact.json");
const capabilities = validate(CapabilitiesSchema, capabilitiesRaw, "capabilities.json");

export default function Home() {
  const codeberg = contact.links.find((l) => l.label === "Codeberg");
  const featuredProjects = createAsync(async () => (await getProjects()).filter((p) => p.featured));
  const latestWriting = createAsync(async () => (await getWriting()).slice(0, 3));

  const stats = [
    { label: "Runtime", value: "Cloudflare Workers" },
    { label: "Interface", value: profile.role },
    { label: "Availability", value: profile.availability },
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
              <h1 class="max-w-3xl text-4xl font-semibold tracking-normal text-(--blueprint-text) sm:text-5xl lg:text-6xl">{profile.name}</h1>
              <p class="max-w-2xl text-lg leading-8 text-(--blueprint-muted) sm:text-xl">{profile.summary}</p>
            </div>
          </div>

          <BlueprintFrame class="p-5">
            <dl class="grid gap-4 sm:grid-cols-3">
              <For each={stats}>
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
      </section>

      <Grid4 items={capabilities.capabilities} />

      {/* Writing + Contact */}
      <section class="section-motion motion-delay-2 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <BlueprintFrame class="p-5">
          <SectionHeading
            label="Writing"
            title="Notes from the build."
            description="Short technical writing about Astro, security boundaries, responsive UI, and Cloudflare deployment."
          />
        </BlueprintFrame>

        <BlueprintFrame class="flex flex-col justify-between gap-6 p-5">
          <div class="space-y-3">
            <p class="blueprint-label">Contact Endpoint</p>
            <h2 class="text-2xl font-semibold text-(--blueprint-text)">Static links, no message collection.</h2>
            <p class="text-sm leading-6 text-(--blueprint-muted)">{profile.summary}</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkAction href="/contact" variant="secondary">Open contact</LinkAction>
            <LinkAction href={`mailto:${profile.email}`} variant="accent">{profile.email}</LinkAction>
            {codeberg && (
              <LinkAction href={codeberg.href} external={codeberg.external} variant="warm-secondary">{codeberg.label}</LinkAction>
            )}
          </div>
        </BlueprintFrame>
      </section>
    </div>
  );
}
