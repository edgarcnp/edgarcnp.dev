use dioxus::prelude::*;

use super::{UiIconSearch, UiInput, helpers::width_style};

#[component]
pub fn UiSearchBar(
    id: String,
    aria_label: String,
    #[props(default)] value: String,
    #[props(default)] placeholder: String,
    #[props(default)] small: bool,
    #[props(default)] width: String,
    #[props(default)] class: String,
    #[props(default)] oninput: EventHandler<String>,
) -> Element {
    let style = width_style(&width);

    rsx! {
        div { class: "ui-search-bar", style, role: "search",
            UiInput {
                id,
                aria_label,
                value,
                placeholder,
                small,
                class,
                width: "100%".to_string(),
                input_type: "search".to_string(),
                leading: rsx! { UiIconSearch {} },
                oninput,
            }
        }
    }
}
