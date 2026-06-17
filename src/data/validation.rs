use std::collections::HashSet;

use super::domain::validate_safe_link_href;
use super::types::{Capability, ContactLink, Profile, Project, ProjectLink, WritingPost};

pub(super) fn validate_content(
    profile: &Profile,
    projects: &[Project],
    contact_links: &[ContactLink],
    capabilities: &[Capability],
    writing_posts: &[WritingPost],
) -> Result<(), String> {
    validate_required("profile.name", &profile.name)?;
    validate_required("profile.role", &profile.role)?;
    validate_required("profile.summary", &profile.summary)?;
    validate_required("profile.availability", &profile.availability)?;
    validate_email(&profile.email)?;

    validate_projects(projects)?;
    validate_contact_links(contact_links)?;
    validate_capabilities(capabilities)?;
    validate_writing_posts(writing_posts)?;

    Ok(())
}

fn validate_projects(projects: &[Project]) -> Result<(), String> {
    if projects.is_empty() {
        return Err("at least one project is required".to_string());
    }

    let mut slugs = HashSet::new();
    for project in projects {
        validate_project(project)?;
        if !slugs.insert(project.slug.as_str()) {
            return Err(format!("duplicate project slug: {}", project.slug));
        }
    }

    if !projects.iter().any(|project| project.featured) {
        return Err("at least one featured project is required".to_string());
    }

    Ok(())
}

fn validate_contact_links(contact_links: &[ContactLink]) -> Result<(), String> {
    if contact_links.is_empty() {
        return Err("at least one contact link is required".to_string());
    }

    for link in contact_links {
        validate_contact_link(link)?;
    }

    Ok(())
}

fn validate_writing_posts(writing_posts: &[WritingPost]) -> Result<(), String> {
    let mut writing_slugs = HashSet::new();
    for post in writing_posts {
        validate_writing_post(post)?;
        if !writing_slugs.insert(post.slug.as_str()) {
            return Err(format!("duplicate writing slug: {}", post.slug));
        }
    }

    Ok(())
}

pub(super) fn validate_project(project: &Project) -> Result<(), String> {
    validate_required("project.title", &project.title)?;
    validate_required("project.summary", &project.summary)?;
    validate_required("project.detail_html", &project.detail_html)?;

    if !is_safe_slug(&project.slug) {
        return Err(format!("project slug is not URL-safe: {}", project.slug));
    }

    if project.year < 2000 || project.year > 2100 {
        return Err(format!(
            "project year is outside the allowed range: {}",
            project.year
        ));
    }

    if project.updated < project.published {
        return Err(format!(
            "project updated date cannot be earlier than published date: {}",
            project.slug
        ));
    }

    if project.technologies.is_empty() {
        return Err(format!("project has no technologies: {}", project.slug));
    }

    for technology in &project.technologies {
        validate_required("project.technologies[]", technology)?;
    }

    for link in &project.links {
        validate_project_link(link)?;
    }

    if project.detail_html.contains("<script") || project.detail_html.contains("<iframe") {
        return Err(format!(
            "project detail contains disallowed HTML after Markdown rendering: {}",
            project.slug
        ));
    }

    Ok(())
}

pub(super) fn validate_project_link(link: &ProjectLink) -> Result<(), String> {
    validate_required("project.links[].label", &link.label)?;
    validate_link_href("project link", &link.label, &link.href, link.external)
}

pub(super) fn validate_contact_link(link: &ContactLink) -> Result<(), String> {
    validate_required("contact.label", &link.label)?;
    validate_required("contact.detail", &link.detail)?;
    validate_link_href("contact link", &link.label, &link.href, link.external)
}

pub(super) fn validate_capabilities(capabilities: &[Capability]) -> Result<(), String> {
    if capabilities.is_empty() {
        return Err("at least one capability is required".to_string());
    }

    for capability in capabilities {
        validate_required("capability.label", &capability.label)?;
        validate_required("capability.title", &capability.title)?;
        validate_required("capability.description", &capability.description)?;
    }

    Ok(())
}

pub(super) fn validate_writing_post(post: &WritingPost) -> Result<(), String> {
    validate_required("writing.title", &post.title)?;
    validate_required("writing.summary", &post.summary)?;
    validate_required("writing.html", &post.html)?;

    if !is_safe_slug(&post.slug) {
        return Err(format!("writing slug is not URL-safe: {}", post.slug));
    }

    if post.tags.is_empty() {
        return Err(format!("writing post has no tags: {}", post.slug));
    }

    if post.updated < post.published {
        return Err(format!(
            "writing updated date cannot be earlier than published date: {}",
            post.slug
        ));
    }

    for tag in &post.tags {
        validate_required("writing.tags[]", tag)?;
    }

    if post.html.contains("<script") || post.html.contains("<iframe") {
        return Err(format!(
            "writing post contains disallowed HTML after Markdown rendering: {}",
            post.slug
        ));
    }

    Ok(())
}

fn validate_email(email: &str) -> Result<(), String> {
    validate_required("profile.email", email)?;
    if email.contains('@') && !email.starts_with('@') && !email.ends_with('@') {
        Ok(())
    } else {
        Err("profile.email must contain a basic email address".to_string())
    }
}

fn validate_required(field: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(())
    }
}

fn validate_link_href(
    context: &str,
    label: &str,
    href: &str,
    external: bool,
) -> Result<(), String> {
    validate_safe_link_href(href)
        .map_err(|reason| format!("{context} uses an invalid URL ({reason}): {label}"))?;

    if external && !href.starts_with("https://") {
        return Err(format!("external {context} must use HTTPS: {label}"));
    }

    Ok(())
}

pub(super) fn is_safe_slug(slug: &str) -> bool {
    !slug.is_empty()
        && !slug.starts_with('-')
        && !slug.ends_with('-')
        && slug
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
}
