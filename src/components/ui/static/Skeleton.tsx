/**
 * Props for the Skeleton component.
 */
type SkeletonProps = {
    /** Additional CSS classes. */
    class?: string;
    /** Width variant: "full" (100%) or "half" (50%). Default: "full". */
    width?: "full" | "half";
    /** Height variant: "sm" (8px), "md" (16px), "lg" (32px). Default: "md". */
    height?: "sm" | "md" | "lg";
};

/**
 * Placeholder loading skeleton with pulsing animation.
 *
 * @remarks
 * - Uses CSS classes for sizing instead of inline styles (CSP-safe).
 * - Width/height are mapped to predefined CSS classes.
 * - The `skeleton` CSS class handles the pulse animation.
 * - Respects `prefers-reduced-motion: reduce` — animation is disabled.
 */
export function Skeleton(props: SkeletonProps) {
    const classes = () => [
        "skeleton",
        props.width === "half" ? "skeleton-w-half" : "skeleton-w-full",
        props.height === "sm" ? "skeleton-h-sm" : props.height === "lg" ? "skeleton-h-lg" : "skeleton-h-md",
        props.class,
    ].filter(Boolean).join(" ");

    return <div class={classes()} />;
}
