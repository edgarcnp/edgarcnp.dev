export interface IconProps {
    class?: string
}

export type ProjectStatus = "Planned" | "In Progress" | "Archived"

export type ActionVariant = "primary" | "secondary" | "ghost"

export const ACTION_CLASSES: Record<ActionVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
}

export const STATUS_CLASSES: Record<ProjectStatus, string> = {
    "In Progress": "badge badge--success",
    Planned: "badge badge--neutral",
    Archived: "badge badge--neutral",
}
