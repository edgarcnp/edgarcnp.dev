import type { JSX } from 'solid-js';

/**
 * Props for the BlueprintFrame container component.
 */
interface Props {
  /** Additional CSS classes to merge with the default blueprint styling. */
  class?: string;
  /** Content rendered inside the frame. */
  children: JSX.Element;
}

/**
 * Bordered container with blueprint visual styling.
 *
 * @remarks
 * Applies the `blueprint-frame` CSS class for consistent border/background treatment.
 * Used for content cards, sections, and any container that needs the blueprint aesthetic.
 */
export function BlueprintFrame(props: Props) {
  return (
    <div class={`blueprint-frame ${props.class ?? ''}`}>
      {props.children}
    </div>
  );
}
