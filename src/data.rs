use serde::Deserialize;
use std::collections::HashSet;
use std::sync::LazyLock;

const PROFILE_SOURCE: &str = include_str!("../content/profile.toml");
const CONTACT_SOURCE: &str = include_str!("../content/contact.toml");
const PROJECT_SOURCES: &[&str] = &[
    include_str!("../content/projects/secure-portfolio-platform.toml"),
    include_str!("../content/projects/progressive-loading-system.toml"),
    include_str!("../content/projects/worker-security-header-layer.toml"),
    include_str!("../content/projects/structured-portfolio-content.toml"),
];
const WRITING_SOURCES: &[&str] = &[include_str!(
    "../content/writing/secure-portfolio-foundation.md"
)];
const PROJECT_STAGES: &[&str] = &["Planned", "In Progress", "Archived"];

static CONTENT: LazyLock<PortfolioContent> =
    LazyLock::new(|| load_content().expect("portfolio content must be valid"));

#[derive(Clone, PartialEq, Deserialize)]
pub struct Profile {
    pub name: String,
    pub role: String,
    pub summary: String,
    pub email: String,
}

#[derive(Clone, PartialEq, Deserialize)]
pub struct Project {
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub detail: String,
    pub year: u16,
    pub status: String,
    pub role: String,
    pub technologies: Vec<String>,
    pub featured: bool,
}

#[derive(Clone, PartialEq, Deserialize)]
pub struct ContactLink {
    pub label: String,
    pub href: String,
    pub detail: String,
    pub external: bool,
}

#[derive(Clone, PartialEq)]
pub struct WritingPost {
    pub title: String,
    pub slug: String,
    pub summary: String,
    pub published: String,
    pub tags: Vec<String>,
    pub html: String,
}

#[derive(Deserialize)]
struct ContactContent {
    links: Vec<ContactLink>,
}

#[derive(Deserialize)]
struct WritingFrontmatter {
    title: String,
    slug: String,
    summary: String,
    published: String,
    tags: Vec<String>,
}

struct PortfolioContent {
    profile: Profile,
    projects: Vec<Project>,
    contact_links: Vec<ContactLink>,
    writing_posts: Vec<WritingPost>,
}

pub fn profile() -> &'static Profile {
    &CONTENT.profile
}

pub fn projects() -> &'static [Project] {
    &CONTENT.projects
}

pub fn contact_links() -> &'static [ContactLink] {
    &CONTENT.contact_links
}

pub fn writing_posts() -> &'static [WritingPost] {
    &CONTENT.writing_posts
}

pub fn featured_projects() -> impl Iterator<Item = Project> {
    projects()
        .iter()
        .filter(|project| project.featured)
        .cloned()
}

pub fn find_project(slug: &str) -> Option<Project> {
    projects()
        .iter()
        .find(|project| project.slug == slug)
        .cloned()
}

pub fn find_writing_post(slug: &str) -> Option<WritingPost> {
    writing_posts()
        .iter()
        .find(|post| post.slug == slug)
        .cloned()
}

fn load_content() -> Result<PortfolioContent, String> {
    let profile = parse_profile(PROFILE_SOURCE)?;
    let contact_links = parse_contact_links(CONTACT_SOURCE)?;
    let projects = parse_projects(PROJECT_SOURCES)?;
    let writing_posts = parse_writing_posts(WRITING_SOURCES)?;
    validate_content(&profile, &projects, &contact_links, &writing_posts)?;

    Ok(PortfolioContent {
        profile,
        projects,
        contact_links,
        writing_posts,
    })
}

fn parse_profile(source: &str) -> Result<Profile, String> {
    toml::from_str(source).map_err(|error| format!("invalid profile content: {error}"))
}

fn parse_contact_links(source: &str) -> Result<Vec<ContactLink>, String> {
    let content: ContactContent =
        toml::from_str(source).map_err(|error| format!("invalid contact content: {error}"))?;
    Ok(content.links)
}

fn parse_projects(sources: &[&str]) -> Result<Vec<Project>, String> {
    sources
        .iter()
        .map(|source| {
            toml::from_str(source).map_err(|error| format!("invalid project content: {error}"))
        })
        .collect()
}

fn parse_writing_posts(sources: &[&str]) -> Result<Vec<WritingPost>, String> {
    sources
        .iter()
        .map(|source| parse_writing_post(source))
        .collect()
}

fn parse_writing_post(source: &str) -> Result<WritingPost, String> {
    let normalized_source = source.replace("\r\n", "\n");
    let (frontmatter_source, markdown) = split_frontmatter(&normalized_source)?;
    let frontmatter: WritingFrontmatter = toml::from_str(frontmatter_source)
        .map_err(|error| format!("invalid writing frontmatter: {error}"))?;

    Ok(WritingPost {
        title: frontmatter.title,
        slug: frontmatter.slug,
        summary: frontmatter.summary,
        published: frontmatter.published,
        tags: frontmatter.tags,
        html: render_markdown(markdown),
    })
}

fn split_frontmatter(source: &str) -> Result<(&str, &str), String> {
    let Some(rest) = source.strip_prefix("+++\n") else {
        return Err("writing post must start with TOML frontmatter".to_string());
    };
    let Some((frontmatter, markdown)) = rest.split_once("\n+++\n") else {
        return Err("writing post must close TOML frontmatter".to_string());
    };
    Ok((frontmatter, markdown))
}

fn render_markdown(markdown: &str) -> String {
    let parser = pulldown_cmark::Parser::new_ext(
        markdown,
        pulldown_cmark::Options::ENABLE_FOOTNOTES
            | pulldown_cmark::Options::ENABLE_STRIKETHROUGH
            | pulldown_cmark::Options::ENABLE_TABLES,
    );
    let parser = parser.map(|event| match event {
        pulldown_cmark::Event::Html(html) => pulldown_cmark::Event::Text(escape_html(&html).into()),
        pulldown_cmark::Event::InlineHtml(html) => {
            pulldown_cmark::Event::Text(escape_html(&html).into())
        }
        other => other,
    });
    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, parser);
    html
}

fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

fn validate_content(
    profile: &Profile,
    projects: &[Project],
    contact_links: &[ContactLink],
    writing_posts: &[WritingPost],
) -> Result<(), String> {
    validate_required("profile.name", &profile.name)?;
    validate_required("profile.role", &profile.role)?;
    validate_required("profile.summary", &profile.summary)?;
    validate_email(&profile.email)?;

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

    if contact_links.is_empty() {
        return Err("at least one contact link is required".to_string());
    }

    for link in contact_links {
        validate_contact_link(link)?;
    }

    let mut writing_slugs = HashSet::new();
    for post in writing_posts {
        validate_writing_post(post)?;
        if !writing_slugs.insert(post.slug.as_str()) {
            return Err(format!("duplicate writing slug: {}", post.slug));
        }
    }

    Ok(())
}

fn validate_project(project: &Project) -> Result<(), String> {
    validate_required("project.title", &project.title)?;
    validate_required("project.summary", &project.summary)?;
    validate_required("project.detail", &project.detail)?;
    validate_required("project.status", &project.status)?;
    validate_required("project.role", &project.role)?;

    if !is_safe_slug(&project.slug) {
        return Err(format!("project slug is not URL-safe: {}", project.slug));
    }

    if !PROJECT_STAGES.contains(&project.status.as_str()) {
        return Err(format!(
            "project status must be one of {}: {}",
            PROJECT_STAGES.join(", "),
            project.status
        ));
    }

    if project.year < 2000 || project.year > 2100 {
        return Err(format!(
            "project year is outside the allowed range: {}",
            project.year
        ));
    }

    if project.technologies.is_empty() {
        return Err(format!("project has no technologies: {}", project.slug));
    }

    for technology in &project.technologies {
        validate_required("project.technologies[]", technology)?;
    }

    Ok(())
}

fn validate_contact_link(link: &ContactLink) -> Result<(), String> {
    validate_required("contact.label", &link.label)?;
    validate_required("contact.detail", &link.detail)?;

    if !(link.href.starts_with("mailto:") || link.href.starts_with("https://")) {
        return Err(format!(
            "contact link uses a disallowed URL scheme: {}",
            link.label
        ));
    }

    if link.external && !link.href.starts_with("https://") {
        return Err(format!(
            "external contact link must use HTTPS: {}",
            link.label
        ));
    }

    Ok(())
}

fn validate_writing_post(post: &WritingPost) -> Result<(), String> {
    validate_required("writing.title", &post.title)?;
    validate_required("writing.summary", &post.summary)?;
    validate_required("writing.published", &post.published)?;
    validate_required("writing.html", &post.html)?;

    if !is_safe_slug(&post.slug) {
        return Err(format!("writing slug is not URL-safe: {}", post.slug));
    }

    if post.tags.is_empty() {
        return Err(format!("writing post has no tags: {}", post.slug));
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

fn is_safe_slug(slug: &str) -> bool {
    !slug.is_empty()
        && !slug.starts_with('-')
        && !slug.ends_with('-')
        && slug
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_content_is_valid() {
        load_content().expect("bundled content should validate");
    }

    #[test]
    fn project_slugs_are_unique_and_url_safe() {
        let content = load_content().expect("bundled content should validate");
        for project in &content.projects {
            assert!(
                is_safe_slug(&project.slug),
                "{} is not URL-safe",
                project.slug
            );
            let matches = content
                .projects
                .iter()
                .filter(|candidate| candidate.slug == project.slug)
                .count();
            assert_eq!(matches, 1, "{} is duplicated", project.slug);
        }
    }

    #[test]
    fn contact_links_use_allowed_schemes() {
        let content = load_content().expect("bundled content should validate");
        for link in &content.contact_links {
            assert!(
                link.href.starts_with("mailto:") || link.href.starts_with("https://"),
                "{} uses a disallowed URL scheme",
                link.label
            );
            assert!(
                !link.external || link.href.starts_with("https://"),
                "{} opens externally without HTTPS",
                link.label
            );
        }
    }

    #[test]
    fn featured_projects_are_in_project_list() {
        let content = load_content().expect("bundled content should validate");
        let featured_count = content
            .projects
            .iter()
            .filter(|project| project.featured)
            .count();
        assert!(featured_count > 0);
        assert!(featured_count < content.projects.len());
    }

    #[test]
    fn project_statuses_use_allowed_stages() {
        let content = load_content().expect("bundled content should validate");
        for project in &content.projects {
            assert!(
                PROJECT_STAGES.contains(&project.status.as_str()),
                "{} has invalid status {}",
                project.slug,
                project.status
            );
        }
    }

    #[test]
    fn writing_posts_are_findable_by_slug() {
        let content = load_content().expect("bundled content should validate");
        for post in &content.writing_posts {
            assert!(is_safe_slug(&post.slug));
            assert!(find_writing_post(&post.slug).is_some());
        }
    }

    #[test]
    fn markdown_raw_html_is_escaped() {
        let html = render_markdown("<script>alert('xss')</script>");
        assert!(!html.contains("<script>"));
        assert!(html.contains("script"), "rendered output was: {html}");
    }
}
