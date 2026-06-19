import { IconLoader } from "../icons/index";
import type { JSX } from "solid-js";

type SpinnerProps = {
    size?: number;
    class?: string;
};

export function Spinner(props: SpinnerProps) {
    const size = () => props.size ?? 24;

    return (
        <div class={`spinner ${props.class ?? ""}`} style={{ "--size": `${size()}px` } as JSX.CSSProperties}>
            <IconLoader />
        </div>
    );
}
