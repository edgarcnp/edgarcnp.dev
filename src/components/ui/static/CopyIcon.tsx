import { IconCopy, IconLink, IconCheck } from "../icons/index";

/**
 * Props for the CopyIcon component.
 */
type CopyIconProps = {
    /** Whether to show the check (copied) state. */
    check: boolean;
    /** Whether to show the link icon instead of the copy icon. */
    link?: boolean;
    /** Additional CSS classes. */
    class?: string;
};

/**
 * Animated copy/link icon that toggles between states.
 *
 * @remarks
 * - Shows `IconCopy` or `IconLink` in the default state.
 * - Shows `IconCheck` when `check` is true (post-copy feedback).
 * - CSS transitions handle the animation between states.
 */
export function CopyIcon(props: CopyIconProps) {
    const classes = () => [
        "copy-animation",
        props.check && "check",
        props.class,
    ].filter(Boolean).join(" ");

    return (
        <div class={classes()}>
            <div class="icon-copy">
                {props.link ? <IconLink /> : <IconCopy />}
            </div>
            <div class="icon-check">
                <IconCheck />
            </div>
        </div>
    );
}
