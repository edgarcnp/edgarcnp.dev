type SkeletonProps = {
    class?: string;
    width?: string;
    height?: string;
};

export function Skeleton(props: SkeletonProps) {
    return (
        <div
            class={`skeleton ${props.class ?? ""}`}
            style={{ width: props.width, height: props.height }}
        />
    );
}
