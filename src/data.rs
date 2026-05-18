#[derive(Clone, Copy, PartialEq)]
pub struct Profile {
    pub name: &'static str,
    pub role: &'static str,
    pub summary: &'static str,
    pub email: &'static str,
}

#[derive(Clone, Copy, PartialEq)]
pub struct Project {
    pub title: &'static str,
    pub slug: &'static str,
    pub summary: &'static str,
    pub detail: &'static str,
    pub year: u16,
    pub status: &'static str,
    pub role: &'static str,
    pub technologies: &'static [&'static str],
    pub featured: bool,
}

#[derive(Clone, Copy, PartialEq)]
pub struct ContactLink {
    pub label: &'static str,
    pub href: &'static str,
    pub detail: &'static str,
    pub external: bool,
}

pub const PROFILE: Profile = Profile {
    name: "Edgar Christian",
    role: "Software Engineer",
    summary: "Software engineer building secure, pragmatic web systems with Rust, Dioxus, and Cloudflare.",
    email: "me@edgarcnp.dev",
};

pub const PROJECTS: [Project; 4] = [
    Project {
        title: "Secure Portfolio Platform",
        slug: "secure-portfolio-platform",
        summary: "A Dioxus Fullstack portfolio planned around SSR, Cloudflare Workers, static contact links, and strict content boundaries.",
        detail: "This project establishes the portfolio foundation: Dioxus Fullstack, Dioxus Router, dark-only responsive UI, static contact links, and Cloudflare Worker deployment planning.",
        year: 2026,
        status: "In progress",
        role: "Owner and engineer",
        technologies: &["Rust", "Dioxus", "Cloudflare"],
        featured: true,
    },
    Project {
        title: "Progressive Loading System",
        slug: "progressive-loading-system",
        summary: "Responsive skeleton layouts for delayed states that keep dimensions stable across three major breakpoints.",
        detail: "Skeleton components mirror final page dimensions across mobile, tablet, and desktop layouts while respecting reduced-motion preferences.",
        year: 2026,
        status: "Planned",
        role: "Frontend engineer",
        technologies: &["Tailwind", "Accessibility", "SSR"],
        featured: true,
    },
    Project {
        title: "Worker Security Header Layer",
        slug: "worker-security-header-layer",
        summary: "A Cloudflare Worker response hardening layer for CSP, referrer policy, permissions policy, and related headers.",
        detail: "The Worker layer will centralize response headers and deployment checks without introducing a third-party Cloudflare bridge crate.",
        year: 2026,
        status: "Planned",
        role: "Security-focused engineer",
        technologies: &["Cloudflare", "Security", "HTTP"],
        featured: false,
    },
    Project {
        title: "Structured Portfolio Content",
        slug: "structured-portfolio-content",
        summary: "Validated local content files for profile data, project metadata, writing, and external links.",
        detail: "The next content phase will migrate this static Rust data into structured files while preserving the typed validation boundary.",
        year: 2026,
        status: "Planned",
        role: "Rust engineer",
        technologies: &["Rust", "Validation", "Content"],
        featured: false,
    },
];

pub const CONTACT_LINKS: [ContactLink; 2] = [
    ContactLink {
        label: "Email",
        href: "mailto:me@edgarcnp.dev",
        detail: "Open your mail client",
        external: false,
    },
    ContactLink {
        label: "GitHub",
        href: "https://github.com/edgarcnp",
        detail: "Project and code profile",
        external: true,
    },
];

pub fn featured_projects() -> impl Iterator<Item = Project> {
    PROJECTS.iter().copied().filter(|project| project.featured)
}

pub fn find_project(slug: &str) -> Option<Project> {
    PROJECTS
        .iter()
        .copied()
        .find(|project| project.slug == slug)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn project_slugs_are_unique_and_url_safe() {
        for project in PROJECTS {
            assert!(
                is_safe_slug(project.slug),
                "{} is not URL-safe",
                project.slug
            );
            let matches = PROJECTS
                .iter()
                .filter(|candidate| candidate.slug == project.slug)
                .count();
            assert_eq!(matches, 1, "{} is duplicated", project.slug);
        }
    }

    #[test]
    fn contact_links_use_allowed_schemes() {
        for link in CONTACT_LINKS {
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
        let featured_count = featured_projects().count();
        assert!(featured_count > 0);
        assert!(featured_count < PROJECTS.len());
    }

    fn is_safe_slug(slug: &str) -> bool {
        !slug.is_empty()
            && !slug.starts_with('-')
            && !slug.ends_with('-')
            && slug
                .bytes()
                .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
    }
}
