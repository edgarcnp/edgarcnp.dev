use crate::Route;
use dioxus::prelude::*;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ActionSize {
    Default,
    Compact,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ActionVariant {
    Primary,
    Secondary,
    Accent,
    WarmSecondary,
}

#[component]
pub fn RouteAction(
    to: Route,
    variant: ActionVariant,
    size: ActionSize,
    children: Element,
) -> Element {
    rsx! {
        Link {
            class: action_classes(variant, size),
            to,
            {children}
        }
    }
}

#[component]
pub fn LinkAction(
    href: String,
    external: bool,
    variant: ActionVariant,
    size: ActionSize,
    children: Element,
) -> Element {
    rsx! {
        a {
            class: action_classes(variant, size),
            href,
            target: if external { "_blank" },
            rel: if external { "noopener noreferrer" },
            {children}
        }
    }
}

#[component]
pub fn SafeAnchor(href: String, external: bool, class: String, children: Element) -> Element {
    rsx! {
        a {
            class,
            href,
            target: if external { "_blank" },
            rel: if external { "noopener noreferrer" },
            {children}
        }
    }
}

fn action_classes(variant: ActionVariant, size: ActionSize) -> &'static str {
    match (variant, size) {
        (ActionVariant::Primary, ActionSize::Default) => {
            "inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--blueprint-accent)] px-5 text-sm font-semibold text-[#061016] outline-none transition hover:bg-[#8be6f5] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--blueprint-bg)]"
        }
        (ActionVariant::Primary, ActionSize::Compact) => {
            "inline-flex min-h-10 items-center justify-center rounded-sm bg-[var(--blueprint-accent)] px-4 text-sm font-semibold text-[#061016] outline-none transition hover:bg-[#8be6f5] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--blueprint-bg)]"
        }
        (ActionVariant::Secondary, ActionSize::Default) => {
            "inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-5 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent)] hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
        }
        (ActionVariant::Secondary, ActionSize::Compact) => {
            "inline-flex min-h-10 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-4 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent)] hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
        }
        (ActionVariant::Accent, ActionSize::Default) => {
            "inline-flex min-h-11 items-center justify-center rounded-sm bg-[rgba(94,214,238,0.08)] px-5 text-sm font-semibold text-[var(--blueprint-accent)] outline-none transition hover:bg-[rgba(94,214,238,0.14)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
        }
        (ActionVariant::Accent, ActionSize::Compact) => {
            "inline-flex min-h-10 items-center justify-center rounded-sm bg-[rgba(94,214,238,0.08)] px-4 text-sm font-semibold text-[var(--blueprint-accent)] outline-none transition hover:bg-[rgba(94,214,238,0.14)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
        }
        (ActionVariant::WarmSecondary, ActionSize::Default) => {
            "inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-5 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent-2)] hover:text-[var(--blueprint-accent-2)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
        }
        (ActionVariant::WarmSecondary, ActionSize::Compact) => {
            "inline-flex min-h-10 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-4 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent-2)] hover:text-[var(--blueprint-accent-2)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
        }
    }
}
