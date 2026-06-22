import { IconExternalLink } from "../icons/index"

/**
 * Props for the CardLink component.
 */
interface CardLinkProps {
    /** Card heading text. */
    title: string
    /** Description paragraph below the title. */
    desc: string
    /** External URL to link to. */
    href: string
    /** Additional CSS classes to merge with the default card styling. */
    class?: string
}

/**
 * External link card with title, description, and external link icon.
 *
 * @remarks
 * - Always opens in a new tab with `rel="noopener noreferrer"`.
 * - Uses `card` and `card-link` classes for consistent card styling.
 * - Displays an external link icon (arrow) next to the description.
 */
export function CardLink(props: CardLinkProps) {
    return (
        <a
            class={`button card card-link ${props.class ?? ""}`}
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div class="link-text">
                <h4>{props.title}</h4>
                <p>{props.desc}</p>
            </div>
            <IconExternalLink />
        </a>
    )
}
