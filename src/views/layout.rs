use crate::Route;
use crate::components::{BlueprintBackground, Footer, Navbar};
use dioxus::prelude::*;

#[component]
pub fn PortfolioLayout() -> Element {
    let current_route = use_route::<Route>();
    let route_key = route_emphasis_key(&current_route);
    let mut emphasis_key = use_signal(|| 0_u64);
    let mut previous_route_key = use_signal(|| route_key.clone());

    use_effect(use_reactive((&route_key,), move |(route_key,)| {
        if previous_route_key().as_str() == route_key.as_str() {
            return;
        }

        previous_route_key.set(route_key.to_string());
        bump_emphasis(&mut emphasis_key);
    }));

    rsx! {
        div {
            class: "blueprint-page antialiased",
            onclick: move |_| {
                bump_emphasis(&mut emphasis_key);
            },
            BlueprintBackground { emphasis_key: emphasis_key() }
            Navbar {}
            main {
                class: "blueprint-shell page-motion mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16",
                Outlet::<Route> {}
            }
            Footer {}
        }
    }
}

fn route_emphasis_key(route: &Route) -> String {
    match route {
        Route::Home {} => "/".to_string(),
        Route::Projects {} => "/projects".to_string(),
        Route::ProjectDetail { slug } => format!("/projects/{slug}"),
        Route::Writing {} => "/writing".to_string(),
        Route::WritingPost { slug } => format!("/writing/{slug}"),
        Route::Contact {} => "/contact".to_string(),
        Route::NotFound { route } => format!("/{}", route.join("/")),
    }
}

fn bump_emphasis(emphasis_key: &mut Signal<u64>) {
    emphasis_key.with_mut(|key| {
        *key = key.wrapping_add(1);
    });
}
