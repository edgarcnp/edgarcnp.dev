use crate::components::{ContactEndpoint, SectionHeading};
use crate::data::contact_links;
use dioxus::prelude::*;

#[component]
pub fn Contact() -> Element {
    rsx! {
        section { class: "max-w-3xl space-y-8",
            SectionHeading {
                label: "Contact Endpoint".to_string(),
                title: "Static links, no message collection.".to_string(),
                description: "Use email or a verified profile link. This portfolio does not collect, store, or relay visitor messages.".to_string(),
            }
            div { class: "section-motion motion-delay-1 grid gap-4 sm:grid-cols-2",
                for link in contact_links() {
                    ContactEndpoint { link: link.clone() }
                }
            }
        }
    }
}
