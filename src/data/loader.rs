use super::parser::{
    parse_capabilities, parse_contact_links, parse_profile, parse_projects, parse_writing_posts,
};
use super::sources::{
    CAPABILITIES_SOURCE, CONTACT_SOURCE, PROFILE_SOURCE, PROJECT_SOURCES, WRITING_SOURCES,
};
use super::types::PortfolioContent;
use super::validation::validate_content;

pub(super) fn load_content() -> Result<PortfolioContent, String> {
    let profile = parse_profile(PROFILE_SOURCE)?;
    let contact_links = parse_contact_links(CONTACT_SOURCE)?;
    let capabilities = parse_capabilities(CAPABILITIES_SOURCE)?;
    let projects = parse_projects(PROJECT_SOURCES)?;
    let writing_posts = parse_writing_posts(WRITING_SOURCES)?;

    validate_content(
        &profile,
        &projects,
        &contact_links,
        &capabilities,
        &writing_posts,
    )?;

    Ok(PortfolioContent {
        profile,
        projects,
        contact_links,
        capabilities,
        writing_posts,
    })
}
