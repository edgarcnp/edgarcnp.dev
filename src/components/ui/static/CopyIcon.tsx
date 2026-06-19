import { IconCopy, IconLink, IconCheck } from "../icons/index";

type CopyIconProps = {
    check: boolean;
    link?: boolean;
    class?: string;
};

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
