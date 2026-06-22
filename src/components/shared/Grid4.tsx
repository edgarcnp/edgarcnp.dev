import { For } from "solid-js";

/**
 * A single capability card item.
 */
interface Item {
  /** Short category label displayed above the title. */
  label: string;
  /** Card heading text. */
  title: string;
  /** Descriptive paragraph below the title. */
  description: string;
}

/**
 * Props for the Grid4 component.
 */
interface Props {
  /** Array of capability items to render in a 4-column grid. */
  items: Item[];
}

/**
 * 4-column responsive grid of capability cards.
 *
 * @remarks
 * - Renders on the home page to showcase key capabilities.
 * - Uses `<For>` for efficient list rendering.
 * - Responsive: 1 column on mobile, 4 columns on `lg` breakpoint.
 * - Each card uses `blueprint-module` styling with `section-motion` animation.
 */
export function Grid4(props: Props) {
  return (
    <section class="section-motion motion-delay-2 grid gap-4 lg:grid-cols-4">
      <For each={props.items}>
        {({ label, title, description }) => (
          <article class="blueprint-module p-5">
            <p class="blueprint-label">{label}</p>
            <h3 class="mt-4 text-lg font-semibold text-(--blueprint-text)">{title}</h3>
            <p class="mt-3 text-sm leading-6 text-(--blueprint-muted)">{description}</p>
          </article>
        )}
      </For>
    </section>
  );
}
