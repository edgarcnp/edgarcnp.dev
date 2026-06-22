import { IconLoader } from "../icons/index"

/**
 * Props for the Spinner component.
 */
interface SpinnerProps {
    /** Spinner diameter in pixels (default: 24). Maps to --size CSS custom property. */
    size?: number
    /** Additional CSS classes. */
    class?: string
}

/**
 * Loading spinner with a rotating loader icon.
 *
 * @remarks
 * - Size is set via the `--size` CSS custom property on the class attribute.
 * - The CSS rule `.spinner svg { width: var(--size); height: var(--size); }` applies the size.
 * - Uses `IconLoader` for the rotating animation.
 * - Respects `prefers-reduced-motion: reduce` — animation is disabled.
 */
export function Spinner(props: SpinnerProps) {
    const sizeClass = () => {
        const size = props.size ?? 24
        return `spinner-size-${size}`
    }

    return (
        <div class={`spinner ${sizeClass()} ${props.class ?? ""}`}>
            <IconLoader />
        </div>
    )
}
