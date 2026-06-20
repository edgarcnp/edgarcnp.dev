import { For, Show, Suspense } from "solid-js";
import { useParams, createAsync, query } from "@solidjs/router";
import { getWritingPost } from "~/lib/server-content";
import { sanitize } from "~/lib/trusted-types";
import { TechTag } from "~/components/shared/TechTag";
import { LinkAction } from "~/components/ui/static/LinkAction";

/** Cached query: single writing post by slug. */
const fetchWritingPost = query(async (slug: string) => getWritingPost(slug), "writingPost");

/**
 * Single writing post detail page — header, tags, and rendered markdown body.
 *
 * @remarks
 * - Uses `useParams()` to get the slug from the URL.
 * - Fetches post data via `"use server"` RPC.
 * - Displays "Post not found" fallback if slug doesn't match any post.
 * - Shows published/updated dates, title, summary, and tag chips.
 * - Renders the markdown body as sanitized HTML via `innerHTML`.
 * - Uses `<For>` for efficient tag list rendering.
 */
export default function WritingPost() {
  const params = useParams<{ slug: string }>();
  const post = createAsync(() => fetchWritingPost(params.slug));

  return (
    <Suspense fallback={<div class="blueprint-label">Loading post...</div>}>
      <Show
        when={post()}
        fallback={
          <section class="blueprint-frame max-w-2xl space-y-5 p-5 sm:p-6">
            <h1 class="text-3xl font-semibold text-(--blueprint-text)">Post not found</h1>
            <LinkAction href="/writings" variant="secondary">Back to writings</LinkAction>
          </section>
        }
      >
        {(p) => (
          <article class="mx-auto max-w-3xl space-y-8">
            <header class="blueprint-frame space-y-5 p-5 sm:p-6">
              <LinkAction href="/writings" variant="secondary">Back to writing</LinkAction>
              <div class="space-y-3">
                <div class="blueprint-label flex flex-wrap gap-x-4 gap-y-1">
                  <span class="whitespace-nowrap">Published {p().published}</span>
                  <span class="whitespace-nowrap">Updated {p().updated}</span>
                </div>
                <h1 class="text-3xl font-semibold text-(--blueprint-text) sm:text-4xl">{p().title}</h1>
                <p class="text-base leading-7 text-(--blueprint-muted)">{p().summary}</p>
              </div>
              <ul class="flex flex-wrap gap-2">
                <For each={p().tags}>
                  {(tag) => (
                    <li><TechTag label={tag} /></li>
                  )}
                </For>
              </ul>
            </header>
            <div class="markdown-body" innerHTML={sanitize(p().body)} />
          </article>
        )}
      </Show>
    </Suspense>
  );
}
