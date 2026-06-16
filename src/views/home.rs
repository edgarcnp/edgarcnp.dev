use crate::Route;
use crate::components::{
    ActionSize, ActionVariant, BlueprintDiagram, BlueprintFrame, BreakpointStrip, CapabilityGrid,
    LinkAction, ProjectCard, RouteAction, SectionHeading,
};
use crate::data::{capabilities, contact_links, featured_projects, profile, writing_posts};
use dioxus::prelude::*;

#[component]
pub fn Home() -> Element {
    let profile = profile();
    let latest_writing = writing_posts().first();
    let codeberg_link = contact_links().iter().find(|link| link.label == "Codeberg");

    rsx! {
        div { class: "space-y-16",
            section {
                class: "section-motion grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center",
                div { class: "space-y-8",
                    div { class: "space-y-5",
                        p { class: "blueprint-label", "Secure web systems / Responsive UI" }
                        div { class: "space-y-4",
                            h1 { class: "max-w-3xl text-4xl font-semibold tracking-normal text-[var(--blueprint-text)] sm:text-5xl lg:text-6xl", "{profile.name}" }
                            p { class: "max-w-2xl text-lg leading-8 text-[var(--blueprint-muted)] sm:text-xl",
                                "{profile.summary}"
                            }
                        }
                    }
                    BlueprintFrame { class: "p-5".to_string(),
                        dl { class: "grid gap-4 sm:grid-cols-3",
                            div {
                                dt { class: "blueprint-label text-[0.68rem]", "Runtime" }
                                dd { class: "mt-1 text-sm text-[var(--blueprint-text)]", "Cloudflare Workers" }
                            }
                            div {
                                dt { class: "blueprint-label text-[0.68rem]", "Interface" }
                                dd { class: "mt-1 text-sm text-[var(--blueprint-text)]", "{profile.role}" }
                            }
                            div {
                                dt { class: "blueprint-label text-[0.68rem]", "Availability" }
                                dd { class: "mt-1 text-sm text-[var(--blueprint-text)]", "{profile.availability}" }
                            }
                        }
                    }
                    div { class: "flex flex-col gap-3 sm:flex-row",
                        RouteAction {
                            to: Route::Projects {},
                            variant: ActionVariant::Primary,
                            size: ActionSize::Default,
                            "View projects"
                        }
                        RouteAction {
                            to: Route::Contact {},
                            variant: ActionVariant::Secondary,
                            size: ActionSize::Default,
                            "Contact"
                        }
                    }
                }
                div { class: "space-y-4",
                    BlueprintDiagram {}
                    BreakpointStrip {}
                }
            }

            section { class: "section-motion motion-delay-1 space-y-6",
                SectionHeading {
                    label: "Selected Work".to_string(),
                    title: "Secure content, responsive UI, and edge deployment.".to_string(),
                    description: "A short list of projects focused on making this portfolio fast, auditable, and stable across devices.".to_string(),
                }
                div { class: "grid gap-4 md:grid-cols-2",
                    for project in featured_projects() {
                        ProjectCard { project: project.clone() }
                    }
                }
            }

            CapabilityGrid { capabilities: capabilities().to_vec() }

            section { class: "section-motion motion-delay-2 grid gap-4 lg:grid-cols-[1fr_1fr]",
                BlueprintFrame { class: "p-5".to_string(),
                    SectionHeading {
                        label: "Writing".to_string(),
                        title: "Notes from the build.".to_string(),
                        description: "Short technical writing about Dioxus, security boundaries, responsive UI, and Cloudflare deployment.".to_string(),
                    }
                    div { class: "mt-6",
                        if let Some(post) = latest_writing {
                            Link {
                                class: "blueprint-module blueprint-module-link block p-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
                                to: Route::WritingPost { slug: post.slug.clone() },
                                p { class: "blueprint-label", "{post.published}" }
                                h3 { class: "mt-3 text-xl font-semibold text-[var(--blueprint-text)]", "{post.title}" }
                                p { class: "mt-3 text-sm leading-6 text-[var(--blueprint-muted)]", "{post.summary}" }
                                span { class: "mt-5 inline-flex font-mono text-xs font-semibold uppercase tracking-wide text-[var(--blueprint-accent)]", "Read note" }
                            }
                        }
                    }
                }
                BlueprintFrame { class: "flex flex-col justify-between gap-6 p-5".to_string(),
                    div { class: "space-y-3",
                        p { class: "blueprint-label", "Contact Endpoint" }
                        h2 { class: "text-2xl font-semibold text-[var(--blueprint-text)]", "Static links, no message collection." }
                        p { class: "text-sm leading-6 text-[var(--blueprint-muted)]",
                            "{profile.summary}"
                        }
                    }
                    div { class: "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
                        RouteAction {
                            to: Route::Contact {},
                            variant: ActionVariant::Secondary,
                            size: ActionSize::Default,
                            "Open contact"
                        }
                        LinkAction {
                            href: "mailto:{profile.email}",
                            external: false,
                            variant: ActionVariant::Accent,
                            size: ActionSize::Default,
                            "{profile.email}"
                        }
                        if let Some(link) = codeberg_link {
                            LinkAction {
                                href: link.href.clone(),
                                external: link.external,
                                variant: ActionVariant::WarmSecondary,
                                size: ActionSize::Default,
                                "{link.label}"
                            }
                        }
                    }
                }
            }
        }
    }
}
