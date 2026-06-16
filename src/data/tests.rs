use super::domain::{
    ContactKind, IsoDate, ProjectStatus, validate_safe_link_href, validate_safe_local_image_src,
};
use super::find_writing_post;
use super::loader::load_content;
use super::markdown::render_markdown;
use super::parser::{parse_contact_links, parse_project, split_frontmatter};
use super::types::ProjectLink;
use super::validation::{is_safe_slug, validate_project_link};

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
            ContactKind::ALL.contains(&link.kind),
            "{} uses an invalid contact kind",
            link.label
        );
        assert!(
            validate_safe_link_href(&link.href).is_ok(),
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
fn rejects_unknown_contact_kind() {
    let error = parse_contact_links(concat!(
        "[[links]]\n",
        "label = \"Example\"\n",
        "kind = \"social\"\n",
        "href = \"https://example.com\"\n",
        "detail = \"Invalid kind\"\n",
        "external = true\n",
    ))
    .expect_err("contact kind should be rejected");
    assert!(
        error.contains("contact.kind must be one of"),
        "unexpected error: {error}"
    );
}

#[test]
fn project_links_are_valid_when_present() {
    let content = load_content().expect("bundled content should validate");
    assert!(
        content
            .projects
            .iter()
            .any(|project| !project.links.is_empty()),
        "at least one project should expose a displayed link"
    );

    for project in &content.projects {
        for link in &project.links {
            assert!(!link.label.trim().is_empty());
            assert!(
                validate_safe_link_href(&link.href).is_ok(),
                "{} has invalid project link {}",
                project.slug,
                link.label
            );
        }
    }
}

#[test]
fn rejects_external_project_links_without_https() {
    let link = ProjectLink {
        label: "Demo".to_string(),
        href: "mailto:hello@example.com".to_string(),
        external: true,
    };

    let error = validate_project_link(&link).expect_err("external link should require HTTPS");
    assert!(error.contains("external project link must use HTTPS"));
}

#[test]
fn accepts_root_relative_project_links_when_not_external() {
    let link = ProjectLink {
        label: "Internal".to_string(),
        href: "/projects/secure-portfolio-platform".to_string(),
        external: false,
    };

    validate_project_link(&link).expect("root-relative internal link should validate");
}

#[test]
fn rejects_malformed_structured_links() {
    for href in [
        "https://",
        "https:///missing-host",
        "https://example.com unsafe",
        "javascript:alert(1)",
        "data:text/html;base64,abc",
        "//example.com/path",
        "/../secret",
        "/%2e%2e/secret",
    ] {
        let link = ProjectLink {
            label: href.to_string(),
            href: href.to_string(),
            external: false,
        };

        assert!(
            validate_project_link(&link).is_err(),
            "{href} should be rejected"
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
fn capability_content_is_complete() {
    let content = load_content().expect("bundled content should validate");
    assert_eq!(content.capabilities.len(), 4);

    for capability in &content.capabilities {
        assert!(!capability.label.trim().is_empty());
        assert!(!capability.title.trim().is_empty());
        assert!(!capability.description.trim().is_empty());
    }
}

#[test]
fn project_statuses_use_allowed_stages() {
    let content = load_content().expect("bundled content should validate");
    for project in &content.projects {
        assert!(
            ProjectStatus::ALL.contains(&project.status),
            "{} has invalid status {}",
            project.slug,
            project.status
        );
    }
}

#[test]
fn project_markdown_details_are_rendered_and_safe() {
    let content = load_content().expect("bundled content should validate");
    for project in &content.projects {
        assert!(
            project.detail_html.contains("<p>"),
            "{} detail did not render Markdown paragraphs",
            project.slug
        );
        assert!(!project.detail_html.contains("<script"));
        assert!(!project.detail_html.contains("<iframe"));
    }
}

#[test]
fn parses_project_frontmatter_and_markdown_body() {
    let project = parse_project(concat!(
        "+++\n",
        "title = \"Example\"\n",
        "slug = \"example-project\"\n",
        "summary = \"Example summary\"\n",
        "year = 2026\n",
        "uploaded = \"2026-06-16\"\n",
        "status = \"Planned\"\n",
        "technologies = [\"Rust\"]\n",
        "featured = false\n",
        "pinned = false\n",
        "\n",
        "[[links]]\n",
        "label = \"Live\"\n",
        "href = \"https://example.com\"\n",
        "external = true\n",
        "+++\n",
        "\n",
        "Project **details**.\n",
    ))
    .expect("fixture project should parse");

    assert_eq!(project.slug, "example-project");
    assert_eq!(project.links.len(), 1);
    assert!(project.detail_html.contains("<strong>details</strong>"));
}

#[test]
fn rejects_documents_without_frontmatter() {
    let error = split_frontmatter("No frontmatter").expect_err("frontmatter should be required");
    assert!(error.contains("must start with TOML frontmatter"));
}

#[test]
fn projects_are_sorted_by_pinned_then_upload_date() {
    let content = load_content().expect("bundled content should validate");
    let ordered_slugs: Vec<_> = content
        .projects
        .iter()
        .map(|project| project.slug.as_str())
        .collect();

    assert_eq!(
        ordered_slugs,
        vec![
            "secure-portfolio-platform",
            "structured-portfolio-content",
            "progressive-loading-system",
            "worker-security-header-layer",
        ]
    );

    for pair in content.projects.windows(2) {
        let current = &pair[0];
        let next = &pair[1];
        assert!(current.pinned || !next.pinned);

        if current.pinned == next.pinned {
            assert!(
                current.uploaded >= next.uploaded,
                "{} should not sort before {}",
                next.slug,
                current.slug
            );
        }
    }
}

#[test]
fn writing_posts_are_findable_by_slug() {
    let content = load_content().expect("bundled content should validate");
    for post in &content.writing_posts {
        assert!(is_safe_slug(&post.slug));
        assert!(is_iso_date(post.published.as_str()));
        assert!(is_iso_date(post.updated.as_str()));
        assert!(post.updated >= post.published);
        assert!(find_writing_post(&post.slug).is_some());
    }
}

#[test]
fn iso_date_validation_rejects_bad_shape_or_ranges() {
    assert!(!is_iso_date("2026-6-16"));
    assert!(!is_iso_date("2026-00-16"));
    assert!(!is_iso_date("2026-13-16"));
    assert!(!is_iso_date("2026-06-00"));
    assert!(!is_iso_date("2026-06-32"));
    assert!(!is_iso_date("2025-02-29"));
    assert!(is_iso_date("2024-02-29"));
}

#[test]
fn markdown_raw_html_is_escaped() {
    let html = render_markdown("<script>alert('xss')</script>").expect("Markdown should render");
    assert!(!html.contains("<script>"));
    assert!(html.contains("script"), "rendered output was: {html}");
}

#[test]
fn markdown_rejects_unsafe_link_destinations() {
    for markdown in [
        "[bad](javascript:alert(1))",
        "[bad](data:text/html;base64,abc)",
        "[bad](//example.com/path)",
        "[bad](/../secret)",
        "[bad](https://)",
    ] {
        let error = render_markdown(markdown).expect_err("unsafe link should fail");
        assert!(
            error.contains("Markdown link destination is invalid"),
            "unexpected error: {error}"
        );
    }
}

#[test]
fn markdown_accepts_safe_links() {
    let html = render_markdown(
        "[site](https://example.com/path) [mail](mailto:hello@example.com) [local](/projects)",
    )
    .expect("safe links should render");

    assert!(html.contains("href=\"https://example.com/path\""));
    assert!(html.contains("href=\"mailto:hello@example.com\""));
    assert!(html.contains("href=\"/projects\""));
}

#[test]
fn markdown_allows_only_safe_local_images() {
    assert!(validate_safe_local_image_src("/assets/logo-cropped.png").is_ok());
    assert!(render_markdown("![Logo](/assets/logo-cropped.png)").is_ok());

    for markdown in [
        "![bad](https://example.com/logo.png)",
        "![bad](/uploads/logo.png)",
        "![bad](/assets/../secret.png)",
        "![bad](/assets/file.txt)",
        "![bad](javascript:alert(1))",
    ] {
        let error = render_markdown(markdown).expect_err("unsafe image should fail");
        assert!(
            error.contains("Markdown image source is invalid"),
            "unexpected error: {error}"
        );
    }
}

fn is_iso_date(value: &str) -> bool {
    IsoDate::parse("test.date", value.to_string()).is_ok()
}
