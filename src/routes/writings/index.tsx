import { For, Suspense } from "solid-js";
import { A, createAsync, query } from "@solidjs/router";
import { getWriting } from "~/lib/server-content";
import SectionHeading from "~/components/shared/SectionHeading";
import TechTag from "~/components/shared/TechTag";

const fetchWriting = query(async () => await getWriting(), "writing");

export default function Writing() {
  const posts = createAsync(() => fetchWriting());

  return (
    <div class="space-y-8">
      <SectionHeading
        label="Writing"
        title="Notes from the build."
        description="Short technical writing about security, responsive UI, and deployment."
      />

      <Suspense fallback={<div class="blueprint-label">Loading posts...</div>}>
        <div class="space-y-4">
          <For each={posts() ?? []}>
            {(post) => (
              <A
                href={`/writings/${post.slug}`}
                class="blueprint-module blueprint-module-link block p-5 outline-none focus-visible:ring-2 focus-visible:ring-(--blueprint-accent)"
              >
                <div class="blueprint-label flex flex-wrap gap-x-4 gap-y-1">
                  <span class="whitespace-nowrap">Published {post.published}</span>
                  <span class="whitespace-nowrap">Updated {post.updated}</span>
                </div>
                <h2 class="mt-3 text-xl font-semibold text-(--blueprint-text)">{post.title}</h2>
                <p class="mt-3 text-sm leading-6 text-(--blueprint-muted)">{post.summary}</p>
                <ul class="mt-3 flex flex-wrap gap-2">
                  <For each={post.tags}>
                    {(tag) => (
                      <li><TechTag label={tag} /></li>
                    )}
                  </For>
                </ul>
                <span class="mt-5 inline-flex font-mono text-xs font-semibold uppercase tracking-wide text-(--blueprint-accent)">Read note</span>
              </A>
            )}
          </For>
        </div>
      </Suspense>
    </div>
  );
}
