mod domain;
mod loader;
mod markdown;
mod parser;
mod sources;
#[cfg(test)]
mod tests;
mod types;
mod validation;

use std::sync::LazyLock;

pub use domain::ProjectStatus;
pub use types::{Capability, ContactLink, Profile, Project, WritingPost};

static CONTENT: LazyLock<types::PortfolioContent> =
    LazyLock::new(|| loader::load_content().expect("portfolio content must be valid"));

pub fn profile() -> &'static Profile {
    &CONTENT.profile
}

pub fn projects() -> &'static [Project] {
    &CONTENT.projects
}

pub fn contact_links() -> &'static [ContactLink] {
    &CONTENT.contact_links
}

pub fn capabilities() -> &'static [Capability] {
    &CONTENT.capabilities
}

pub fn writing_posts() -> &'static [WritingPost] {
    &CONTENT.writing_posts
}

pub fn featured_projects() -> impl Iterator<Item = &'static Project> {
    projects().iter().filter(|project| project.featured)
}

pub fn find_project(slug: &str) -> Option<&'static Project> {
    projects().iter().find(|project| project.slug == slug)
}

pub fn find_writing_post(slug: &str) -> Option<&'static WritingPost> {
    writing_posts().iter().find(|post| post.slug == slug)
}
