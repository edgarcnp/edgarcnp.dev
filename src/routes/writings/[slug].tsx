import { Show, Suspense } from "solid-js";
import { useLocation, createAsync } from "@solidjs/router";
import { getWritingPost } from "~/lib/server-content";
import type { WritingPost } from "~/lib/content";
import TechTag from "~/components/shared/TechTag";
import { LinkAction } from "~/components/ui/static/LinkAction";

export default function WritingPost() {
  const location = useLocation();
  const slug = () => location.pathname.split("/").pop() ?? "";
  const post = createAsync(async () => getWritingPost(slug()) as WritingPost | undefined);

  return (
    <Suspense fallback={<div class="blueprint-label">Loading post...</div>}>
      <Show when={post()}>
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
                {p().tags.map((tag: string) => (
                  <li><TechTag label={tag} /></li>
                ))}
              </ul>
            </header>
            <div class="markdown-body" innerHTML={p().body} />
          </article>
        )}
      </Show>
    </Suspense>
  );
}
