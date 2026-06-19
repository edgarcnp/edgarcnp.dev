import { Router, A, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense, ErrorBoundary } from "solid-js";
import GradientShimmer from "~/components/background/GradientShimmer";
import { LinkAction } from "~/components/ui/static/LinkAction";
import "./app.css";

const links = [
  { href: "/projects", label: "Projects", match: (p: string) => p.startsWith("/projects") },
  { href: "/writings", label: "Writings", match: (p: string) => p.startsWith("/writings") },
  { href: "/contact", label: "Contact", match: (p: string) => p === "/contact" },
] as const;

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="blueprint-page">
          <GradientShimmer background intro class="shimmer-canvas" />

          <header class="sticky top-0 z-20 border-b border-(--blueprint-line-muted) bg-[rgba(8,10,15,0.82)] px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-8 lg:px-12">
            <nav aria-label="Primary navigation" class="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <A
                href="/"
                class="group flex min-h-11 w-fit items-center gap-3 rounded-sm pr-3 font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-(--blueprint-accent)"
              >
                <span class="grid size-9 place-items-center rounded-sm border border-(--blueprint-line-muted) bg-[rgba(244,247,251,0.035)] text-(--blueprint-muted) transition group-hover:border-(--blueprint-accent) group-hover:text-(--blueprint-accent)">
                  <span class="text-xs font-semibold">EC</span>
                </span>
                <span class="flex flex-col leading-none">
                  <span class="text-sm font-semibold text-(--blueprint-text) transition group-hover:text-(--blueprint-accent)">edgarcnp.dev</span>
                  <span class="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-(--blueprint-muted)">Portfolio</span>
                </span>
              </A>

              <div class="grid grid-cols-3 gap-1 rounded-sm border border-(--blueprint-line-muted) bg-[rgba(244,247,251,0.035)] p-1 text-sm text-(--blueprint-muted) shadow-[inset_0_1px_0_rgba(244,247,251,0.05)] sm:flex sm:w-fit">
                {links.map(({ href, label, match }) => (
                  <A
                    href={href}
                    class="inline-flex min-h-10 items-center justify-center rounded-sm px-3 py-2 outline-none transition focus-visible:ring-2 focus-visible:ring-(--blueprint-accent) sm:min-w-24"
                    activeClass="bg-[rgba(94,214,238,0.12)] font-semibold text-(--blueprint-accent) ring-1 ring-[rgba(94,214,238,0.24)] hover:bg-[rgba(94,214,238,0.16)]"
                    inactiveClass="hover:bg-[rgba(94,214,238,0.08)] hover:text-(--blueprint-accent)"
                  >
                    {label}
                  </A>
                ))}
              </div>
            </nav>
          </header>

          <main class="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
            <Show when={useLocation().pathname} keyed>
              <div class="page-motion">
                <ErrorBoundary fallback={(err) => (
                  <section class="blueprint-frame max-w-2xl space-y-5 p-5 sm:p-6">
                    <p class="blueprint-label">Error</p>
                    <h1 class="text-3xl font-semibold text-(--blueprint-text)">Something went wrong</h1>
                    <p class="leading-7 text-(--blueprint-muted)">{err.message}</p>
                    <LinkAction href="/" variant="primary">Return home</LinkAction>
                  </section>
                )}>
                  <Suspense>{props.children}</Suspense>
                </ErrorBoundary>
              </div>
            </Show>
          </main>

          <footer class="border-t border-(--blueprint-line-muted) px-5 py-8 text-sm text-(--blueprint-subtle) sm:px-8 lg:px-12">
            <div class="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; 2026 Edgar Christian. SolidStart / SolidJS / Cloudflare-ready.</p>
              <a
                href="mailto:hello@edgarcnp.dev"
                class="w-fit rounded-sm text-(--blueprint-muted) underline-offset-4 outline-none transition hover:text-(--blueprint-accent) hover:underline focus-visible:ring-2 focus-visible:ring-(--blueprint-accent)"
              >
                hello@edgarcnp.dev
              </a>
            </div>
          </footer>
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
