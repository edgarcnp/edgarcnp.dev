use dioxus::prelude::*;

use views::{
    Contact, Home, NotFound, PortfolioLayout, ProjectDetail, Projects, Writing, WritingPost,
};

mod components;
mod data;
#[cfg(feature = "web")]
mod renderer;
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
        #[route("/writing/:slug")]
        WritingPost { slug: String },
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
        document::Title { "Edgar Christian" }
        document::Meta {
            name: "description",
            content: "Portfolio website for Edgar Christian."
        }
        Router::<Route> {}
    }
}
