use crate::Route;
use crate::components::{ActionSize, ActionVariant, RouteAction, SectionHeading, TechTag};
use crate::data::{WritingPost as WritingPostData, find_writing_post, writing_posts};
use dioxus::prelude::*;

#[component]
pub fn Writing() -> Element {
    rsx! {
        section { class: "max-w-3xl space-y-7",
            SectionHeading {
                label: "Writing Records".to_string(),
                title: "Notes and technical writing.".to_string(),
                description: "Markdown-backed notes from building the portfolio: Dioxus, content safety, responsive UI, and Cloudflare deployment.".to_string(),
            }
            div { class: "section-motion motion-delay-1 space-y-4",
                for post in writing_posts() {
                    WritingCard { post: post.clone() }
                }
            }
        }
    }
}

#[component]
pub fn WritingPost(slug: String) -> Element {
    match find_writing_post(&slug) {
        Some(post) => rsx! {
            article { class: "mx-auto max-w-3xl space-y-8",
                header { class: "blueprint-frame space-y-5 p-5 sm:p-6",
                    Link {
                        class: "inline-flex rounded-sm font-mono text-xs font-semibold uppercase tracking-wide text-[var(--blueprint-accent)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
                        to: Route::Writing {},
                        "Back to writing"
                    }
                    div { class: "space-y-3",
                        div { class: "blueprint-label flex flex-wrap gap-x-4 gap-y-1",
                            span { class: "whitespace-nowrap", "Published {post.published}" }
                            span { class: "whitespace-nowrap", "Updated {post.updated}" }
                        }
                        h1 { class: "text-3xl font-semibold text-[var(--blueprint-text)] sm:text-4xl", "{post.title}" }
                        p { class: "text-base leading-7 text-[var(--blueprint-muted)]", "{post.summary}" }
                    }
                    ul { class: "flex flex-wrap gap-2",
                        for tag in post.tags.iter() {
                            li { TechTag { label: tag.clone() } }
                        }
                    }
                }
                div {
                    class: "markdown-body",
                    dangerous_inner_html: "{post.html}",
                }
            }
        },
        None => rsx! {
            section { class: "blueprint-frame max-w-2xl space-y-5 p-5",
                p { class: "blueprint-label", "Writing not found" }
                h1 { class: "text-3xl font-semibold text-[var(--blueprint-text)]", "No post matches this slug." }
                p { class: "leading-7 text-[var(--blueprint-muted)]", "The requested writing entry is not part of the validated local content." }
                RouteAction {
                    to: Route::Writing {},
                    variant: ActionVariant::Secondary,
                    size: ActionSize::Default,
                    "Back to writing"
                }
            }
        },
    }
}

#[component]
fn WritingCard(post: WritingPostData) -> Element {
    rsx! {
        Link {
            class: "blueprint-module blueprint-module-link group block p-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
            to: Route::WritingPost { slug: post.slug.clone() },
            div { class: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
                div { class: "space-y-3",
                    div { class: "blueprint-label flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem]",
                        span { class: "whitespace-nowrap", "Published {post.published}" }
                        span { class: "whitespace-nowrap", "Updated {post.updated}" }
                    }
                    h2 { class: "text-xl font-semibold text-[var(--blueprint-text)]", "{post.title}" }
                    p { class: "leading-7 text-[var(--blueprint-muted)]", "{post.summary}" }
                    ul { class: "flex flex-wrap gap-2",
                        for tag in post.tags.iter() {
                            li { TechTag { label: tag.clone() } }
                        }
                    }
                }
                span {
                    class: "w-fit shrink-0 rounded-sm font-mono text-xs font-semibold uppercase tracking-wide text-[var(--blueprint-accent)] underline-offset-4 group-hover:underline",
                    "Read"
                }
            }
        }
    }
}
