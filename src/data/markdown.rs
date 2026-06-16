use pulldown_cmark::{Event, Options, Tag, html};

use super::domain::{validate_safe_link_href, validate_safe_local_image_src};

pub(super) fn render_markdown(markdown: &str) -> Result<String, String> {
    let parser = pulldown_cmark::Parser::new_ext(
        markdown,
        Options::ENABLE_FOOTNOTES | Options::ENABLE_STRIKETHROUGH | Options::ENABLE_TABLES,
    );

    let mut events = Vec::new();
    for event in parser {
        match event {
            Event::Html(raw_html) => events.push(Event::Text(escape_html(&raw_html).into())),
            Event::InlineHtml(raw_html) => events.push(Event::Text(escape_html(&raw_html).into())),
            Event::Start(Tag::Link { ref dest_url, .. }) => {
                validate_safe_link_href(dest_url).map_err(|reason| {
                    format!("Markdown link destination is invalid ({reason}): {dest_url}")
                })?;
                events.push(event);
            }
            Event::Start(Tag::Image { ref dest_url, .. }) => {
                validate_safe_local_image_src(dest_url).map_err(|reason| {
                    format!("Markdown image source is invalid ({reason}): {dest_url}")
                })?;
                events.push(event);
            }
            other => events.push(other),
        }
    }

    let mut html = String::new();
    html::push_html(&mut html, events.into_iter());
    Ok(html)
}

fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}
