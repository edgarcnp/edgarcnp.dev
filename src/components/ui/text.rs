use dioxus::prelude::*;

use super::helpers::join_classes;

#[derive(Clone, Copy, Default, PartialEq, Eq)]
pub enum UiTextVariant {
    Display,
    Title,
    Heading,
    Subheading,
    #[default]
    Body,
    Caption,
}

#[derive(Clone, Copy, Default, PartialEq, Eq)]
pub enum UiTextTone {
    #[default]
    Primary,
    Secondary,
    Tertiary,
    White,
}

#[component]
pub fn UiText(
    #[props(default)] variant: UiTextVariant,
    #[props(default)] tone: UiTextTone,
    #[props(default)] center: bool,
    #[props(default)] class: String,
    children: Element,
) -> Element {
    let base_class = text_classes(variant, tone, center);
    let class = join_classes(&base_class, &class);

    match variant {
        UiTextVariant::Display => rsx! { h1 { class, {children} } },
        UiTextVariant::Title => rsx! { h2 { class, {children} } },
        UiTextVariant::Heading => rsx! { h3 { class, {children} } },
        UiTextVariant::Subheading => rsx! { h4 { class, {children} } },
        UiTextVariant::Body => rsx! { p { class, {children} } },
        UiTextVariant::Caption => rsx! { p { class, {children} } },
    }
}

fn text_classes(variant: UiTextVariant, tone: UiTextTone, center: bool) -> String {
    let variant_class = match variant {
        UiTextVariant::Display => "ui-text-display",
        UiTextVariant::Title => "ui-text-title",
        UiTextVariant::Heading => "ui-text-heading",
        UiTextVariant::Subheading => "ui-text-subheading",
        UiTextVariant::Body => "ui-text-body",
        UiTextVariant::Caption => "ui-text-caption",
    };
    let tone_class = match tone {
        UiTextTone::Primary => "ui-tone-primary",
        UiTextTone::Secondary => "ui-tone-secondary",
        UiTextTone::Tertiary => "ui-tone-tertiary",
        UiTextTone::White => "ui-tone-white",
    };
    let center_class = if center { " center" } else { "" };

    format!("ui-text {variant_class} {tone_class}{center_class}")
}
