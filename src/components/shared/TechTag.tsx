/**
 * Props for the TechTag component.
 */
interface Props {
  /** Technology name to display (e.g. "TypeScript", "Cloudflare Workers"). */
  label: string;
}

/**
 * Small chip displaying a technology name.
 *
 * @remarks
 * - Uses `blueprint-chip` CSS class for consistent chip styling.
 * - Used inside ProjectCard and project detail pages for technology lists.
 */
export function TechTag(props: Props) {
  return (
    <span class="blueprint-chip">{props.label}</span>
  );
}
