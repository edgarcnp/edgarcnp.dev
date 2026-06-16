use serde::Deserialize;

use super::domain::{ContactKind, IsoDate, ProjectStatus};
use super::markdown::render_markdown;
use super::types::{Capability, ContactLink, Profile, Project, ProjectLink, WritingPost};

#[derive(Deserialize)]
struct ContactContent {
    links: Vec<ContactLinkRecord>,
}

#[derive(Deserialize)]
struct CapabilityContent {
    capabilities: Vec<Capability>,
}

#[derive(Deserialize)]
struct ProjectFrontmatter {
    title: String,
    slug: String,
    summary: String,
    year: u16,
    uploaded: String,
    status: String,
    technologies: Vec<String>,
    featured: bool,
    pinned: bool,
    #[serde(default)]
    links: Vec<ProjectLink>,
}

#[derive(Deserialize)]
struct WritingFrontmatter {
    title: String,
    slug: String,
    summary: String,
    published: String,
    updated: String,
    tags: Vec<String>,
}

#[derive(Deserialize)]
struct ContactLinkRecord {
    label: String,
    kind: String,
    href: String,
    detail: String,
    external: bool,
}

pub(super) fn parse_profile(source: &str) -> Result<Profile, String> {
    toml::from_str(source).map_err(|error| format!("invalid profile content: {error}"))
}

pub(super) fn parse_contact_links(source: &str) -> Result<Vec<ContactLink>, String> {
    let content: ContactContent =
        toml::from_str(source).map_err(|error| format!("invalid contact content: {error}"))?;
    content.links.into_iter().map(parse_contact_link).collect()
}

pub(super) fn parse_capabilities(source: &str) -> Result<Vec<Capability>, String> {
    let content: CapabilityContent =
        toml::from_str(source).map_err(|error| format!("invalid capability content: {error}"))?;
    Ok(content.capabilities)
}

pub(super) fn parse_projects(sources: &[&str]) -> Result<Vec<Project>, String> {
    let mut projects: Vec<Project> = sources
        .iter()
        .map(|source| parse_project(source))
        .collect::<Result<_, _>>()?;

    projects.sort_by(|a, b| {
        b.pinned
            .cmp(&a.pinned)
            .then_with(|| b.uploaded.cmp(&a.uploaded))
            .then_with(|| a.title.cmp(&b.title))
    });

    Ok(projects)
}

pub(super) fn parse_project(source: &str) -> Result<Project, String> {
    let normalized_source = source.replace("\r\n", "\n");
    let (frontmatter_source, markdown) = split_frontmatter(&normalized_source)?;
    let frontmatter: ProjectFrontmatter = toml::from_str(frontmatter_source)
        .map_err(|error| format!("invalid project frontmatter: {error}"))?;

    Ok(Project {
        title: frontmatter.title,
        slug: frontmatter.slug,
        summary: frontmatter.summary,
        detail_html: render_markdown(markdown)?,
        year: frontmatter.year,
        uploaded: IsoDate::parse("project.uploaded", frontmatter.uploaded)?,
        status: parse_project_status(&frontmatter.status)?,
        technologies: frontmatter.technologies,
        featured: frontmatter.featured,
        pinned: frontmatter.pinned,
        links: frontmatter.links,
    })
}

pub(super) fn parse_writing_posts(sources: &[&str]) -> Result<Vec<WritingPost>, String> {
    sources
        .iter()
        .map(|source| parse_writing_post(source))
        .collect()
}

pub(super) fn parse_writing_post(source: &str) -> Result<WritingPost, String> {
    let normalized_source = source.replace("\r\n", "\n");
    let (frontmatter_source, markdown) = split_frontmatter(&normalized_source)?;
    let frontmatter: WritingFrontmatter = toml::from_str(frontmatter_source)
        .map_err(|error| format!("invalid writing frontmatter: {error}"))?;

    Ok(WritingPost {
        title: frontmatter.title,
        slug: frontmatter.slug,
        summary: frontmatter.summary,
        published: IsoDate::parse("writing.published", frontmatter.published)?,
        updated: IsoDate::parse("writing.updated", frontmatter.updated)?,
        tags: frontmatter.tags,
        html: render_markdown(markdown)?,
    })
}

fn parse_contact_link(record: ContactLinkRecord) -> Result<ContactLink, String> {
    Ok(ContactLink {
        label: record.label,
        kind: parse_contact_kind(&record.kind)?,
        href: record.href,
        detail: record.detail,
        external: record.external,
    })
}

fn parse_project_status(value: &str) -> Result<ProjectStatus, String> {
    ProjectStatus::parse(value).ok_or_else(|| {
        format!(
            "project.status must be one of {}: {value}",
            ProjectStatus::allowed_values()
        )
    })
}

fn parse_contact_kind(value: &str) -> Result<ContactKind, String> {
    ContactKind::parse(value).ok_or_else(|| {
        format!(
            "contact.kind must be one of {}: {value}",
            ContactKind::allowed_values()
        )
    })
}

pub(super) fn split_frontmatter(source: &str) -> Result<(&str, &str), String> {
    let Some(rest) = source.strip_prefix("+++\n") else {
        return Err("content document must start with TOML frontmatter".to_string());
    };
    let Some((frontmatter, markdown)) = rest.split_once("\n+++\n") else {
        return Err("content document must close TOML frontmatter".to_string());
    };
    Ok((frontmatter, markdown))
}
