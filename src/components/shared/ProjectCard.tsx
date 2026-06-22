import { A } from '@solidjs/router';
import { For } from 'solid-js';

import { StatusBadge } from './StatusBadge';
import { TechTag } from './TechTag';

import type { ProjectStatus } from '~/lib/types';

/**
 * Props for the ProjectCard component.
 */
interface Props {
  /** Project title displayed as the card heading. */
  title: string;
  /** URL path to the project detail page (e.g. "/projects/my-project"). */
  href: string;
  /** Short summary paragraph displayed below the title. */
  summary: string;
  /** Year the project was created or last updated, displayed as a chip. */
  year: number;
  /** Current project status — determines the badge color. */
  status: ProjectStatus;
  /** Array of technology names rendered as tag chips. */
  technologies: string[];
  /** Whether to show the "Pinned" indicator (gold pin icon). */
  pinned?: boolean;
  /** Override the default "Inspect" action label (e.g. "View Code"). */
  actionLabel?: string;
}

/**
 * Interactive project card with title, summary, status badge, and tech tags.
 *
 * @remarks
 * - Renders as a SolidStart `<A>` link for SPA navigation.
 * - Uses `<For>` for efficient list rendering of technology tags.
 * - Displays pinned indicator with gold accent styling when `pinned` is true.
 * - Hover state shows underline on the action label via `group-hover:underline`.
 * - Keyboard accessible: focus-visible ring for outline navigation.
 */
export function ProjectCard(props: Props) {
  return (
    <A
      href={props.href}
      class="blueprint-module blueprint-module-link group flex h-full min-h-72 flex-col justify-between p-5 outline-none focus-visible:ring-2 focus-visible:ring-(--blueprint-accent)"
    >
      <div class="space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-3">
            {props.pinned && (
              <span class="inline-flex w-fit items-center gap-1.5 rounded-sm border border-[rgba(246,201,107,0.35)] bg-[rgba(246,201,107,0.07)] px-2 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wide text-(--blueprint-accent-2)">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 17v5" /><path d="M5 17h14" /><path d="M7 17l2-9h6l2 9" /><path d="M9 8V3h6v5" />
                </svg>
                Pinned
              </span>
            )}
            <h3 class="text-xl font-semibold leading-7 text-(--blueprint-text)">{props.title}</h3>
          </div>
          <span class="blueprint-chip shrink-0">{props.year}</span>
        </div>
        <p class="text-sm leading-6 text-(--blueprint-muted)">{props.summary}</p>
        <ul class="flex flex-wrap gap-2">
          <For each={props.technologies}>
            {(tech) => (
              <li><TechTag label={tech} /></li>
            )}
          </For>
        </ul>
      </div>
      <div class="mt-8 flex items-center justify-between gap-4">
        <StatusBadge status={props.status} />
        <span class="font-mono text-xs font-semibold uppercase tracking-wide text-(--blueprint-accent) underline-offset-4 group-hover:underline">
          {props.actionLabel ?? 'Inspect'}
        </span>
      </div>
    </A>
  );
}
