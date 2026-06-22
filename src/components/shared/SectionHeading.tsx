/**
 * Props for the SectionHeading component.
 */
interface Props {
    /** Small uppercase label displayed above the title (e.g. "Projects", "About Me"). */
    label: string
    /** Main heading text (rendered as h2). */
    title: string
    /** Optional descriptive paragraph displayed below the title. */
    description?: string
}

/**
 * Section header with label, title, and optional description.
 *
 * @remarks
 * Renders a consistent heading block used above content sections.
 * The label uses the `blueprint-label` class for uppercase monospace styling.
 */
export function SectionHeading(props: Props) {
    return (
        <div class="space-y-3">
            <p class="blueprint-label">{props.label}</p>
            <h2 class="text-2xl font-semibold text-(--blueprint-text)">{props.title}</h2>
            {props.description && (
                <p class="text-sm leading-6 text-(--blueprint-muted)">{props.description}</p>
            )}
        </div>
    )
}
