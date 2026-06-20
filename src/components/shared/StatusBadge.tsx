import type { ProjectStatus } from '~/lib/types';
import { STATUS_CLASSES } from '~/lib/types';

/**
 * Props for the StatusBadge component.
 */
interface Props {
  /** Project status — determines which CSS class and text label to display. */
  status: ProjectStatus;
}

/**
 * Colored status badge displaying the project's current state.
 *
 * @remarks
 * - Maps `ProjectStatus` to a CSS class via `STATUS_CLASSES` lookup.
 * - Three variants: "In Progress" (blue), "Planned" (gray), "Archived" (muted).
 * - Used by ProjectCard and project detail pages.
 */
export function StatusBadge(props: Props) {
  return (
    <span class={STATUS_CLASSES[props.status]}>
      {props.status}
    </span>
  );
}
