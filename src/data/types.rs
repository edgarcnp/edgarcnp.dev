use serde::Deserialize;

use super::domain::{ContactKind, IsoDate, ProjectStatus};

#[derive(Clone, Debug, PartialEq, Deserialize)]
pub struct Profile {
    pub name: String,
    pub role: String,
    pub summary: String,
    pub email: String,
    pub availability: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Project {
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub detail_html: String,
    pub year: u16,
    pub uploaded: IsoDate,
    pub status: ProjectStatus,
    pub technologies: Vec<String>,
    pub featured: bool,
    pub pinned: bool,
    pub links: Vec<ProjectLink>,
}

#[derive(Clone, Debug, PartialEq, Deserialize)]
pub struct ProjectLink {
    pub label: String,
    pub href: String,
    pub external: bool,
}

#[derive(Clone, Debug, PartialEq)]
pub struct ContactLink {
    pub label: String,
    pub kind: ContactKind,
    pub href: String,
    pub detail: String,
    pub external: bool,
}

#[derive(Clone, Debug, PartialEq, Deserialize)]
pub struct Capability {
    pub label: String,
    pub title: String,
    pub description: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct WritingPost {
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub published: IsoDate,
    pub updated: IsoDate,
    pub tags: Vec<String>,
    pub html: String,
}

#[derive(Debug)]
pub(super) struct PortfolioContent {
    pub(super) profile: Profile,
    pub(super) projects: Vec<Project>,
    pub(super) contact_links: Vec<ContactLink>,
    pub(super) capabilities: Vec<Capability>,
    pub(super) writing_posts: Vec<WritingPost>,
}
