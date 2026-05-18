use dioxus::prelude::*;

use views::{Contact, Home, NotFound, PortfolioLayout, ProjectDetail, Projects, Writing};

mod components;
mod data;
mod views;

#[derive(Debug, Clone, Routable, PartialEq)]
#[rustfmt::skip]
pub enum Route {
    #[layout(PortfolioLayout)]
        #[route("/")]
        Home {},
        #[route("/projects")]
        Projects {},
        #[route("/projects/:slug")]
        ProjectDetail { slug: String },
        #[route("/writing")]
        Writing {},
        #[route("/contact")]
        Contact {},
        #[route("/:..route")]
        NotFound { route: Vec<String> },
}

const FAVICON: Asset = asset!("/assets/favicon.ico");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

fn main() {
    dioxus::launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        document::Link { rel: "icon", href: FAVICON }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        document::Title { "Edgar Christian - Portfolio" }
        document::Meta {
            name: "description",
            content: "Secure, dark-mode portfolio for Edgar Christian."
        }
        Router::<Route> {}
    }
}
