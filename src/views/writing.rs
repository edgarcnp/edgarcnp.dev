use crate::Route;
use crate::data::{WritingPost as WritingPostData, find_writing_post, writing_posts};
use dioxus::prelude::*;

#[component]
pub fn Writing() -> Element {
    rsx! {
        section { class: "max-w-3xl space-y-7",
            header { class: "space-y-4",
                p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Writing" }
                h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "Notes and Technical Writing" }
                p { class: "text-base leading-7 text-zinc-400",
                    "Markdown-backed notes rendered from validated local content. Embedded HTML is not part of the content model."
                }
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
                header { class: "space-y-4",
                    Link {
                        class: "inline-flex rounded-sm text-sm font-medium text-emerald-300 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-emerald-300",
                        to: Route::Writing {},
                        "Back to writing"
                    }
                    div { class: "space-y-3",
                        p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "{post.published}" }
                        h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "{post.title}" }
                        p { class: "text-base leading-7 text-zinc-400", "{post.summary}" }
                    }
                    ul { class: "flex flex-wrap gap-2",
                        for tag in post.tags.iter() {
                            li { class: "rounded-sm bg-zinc-900 px-2 py-1 text-xs text-zinc-300", "{tag}" }
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
            section { class: "max-w-2xl space-y-5",
                p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Writing not found" }
                h1 { class: "text-3xl font-semibold text-zinc-50", "No post matches this slug." }
                p { class: "leading-7 text-zinc-400", "The requested writing entry is not part of the validated local content." }
                Link {
                    class: "inline-flex min-h-11 items-center rounded-sm border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 outline-none transition hover:border-emerald-300 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
                    to: Route::Writing {},
                    "Back to writing"
                }
            }
        },
    }
}

#[component]
fn WritingCard(post: WritingPostData) -> Element {
    rsx! {
        article { class: "interactive-lift rounded-md border border-zinc-800 bg-zinc-950/80 p-5 hover:border-emerald-300",
            div { class: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
                div { class: "space-y-3",
                    p { class: "text-xs uppercase tracking-wide text-zinc-500", "{post.published}" }
                    h2 { class: "text-xl font-semibold text-zinc-50", "{post.title}" }
                    p { class: "leading-7 text-zinc-400", "{post.summary}" }
                    ul { class: "flex flex-wrap gap-2",
                        for tag in post.tags.iter() {
                            li { class: "rounded-sm bg-zinc-900 px-2 py-1 text-xs text-zinc-300", "{tag}" }
                        }
                    }
                }
                Link {
                    class: "w-fit shrink-0 rounded-sm text-sm font-medium text-emerald-300 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-emerald-300",
                    to: Route::WritingPost { slug: post.slug.clone() },
                    "Read"
                }
            }
        }
    }
}
