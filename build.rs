use std::env;
use std::error::Error;
use std::fs;
use std::path::{Path, PathBuf};

fn main() -> Result<(), Box<dyn Error>> {
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR")?);
    let out_dir = PathBuf::from(env::var("OUT_DIR")?);
    let output_path = out_dir.join("content_sources.rs");

    let profile = manifest_dir.join("content/profile.toml");
    let contact = manifest_dir.join("content/contact.toml");
    let capabilities = manifest_dir.join("content/capabilities.toml");
    let projects_dir = manifest_dir.join("content/projects");
    let writing_dir = manifest_dir.join("content/writing");

    println!("cargo:rerun-if-changed={}", profile.display());
    println!("cargo:rerun-if-changed={}", contact.display());
    println!("cargo:rerun-if-changed={}", capabilities.display());
    println!("cargo:rerun-if-changed={}", projects_dir.display());
    println!("cargo:rerun-if-changed={}", writing_dir.display());

    let project_sources = markdown_files(&projects_dir)?;
    let writing_sources = markdown_files(&writing_dir)?;

    for path in project_sources.iter().chain(writing_sources.iter()) {
        println!("cargo:rerun-if-changed={}", path.display());
    }

    let mut output = String::new();
    output.push_str(&format!(
        "pub(super) const PROFILE_SOURCE: &str = include_str!({});\n",
        rust_string_literal(&profile)
    ));
    output.push_str(&format!(
        "pub(super) const CONTACT_SOURCE: &str = include_str!({});\n",
        rust_string_literal(&contact)
    ));
    output.push_str(&format!(
        "pub(super) const CAPABILITIES_SOURCE: &str = include_str!({});\n\n",
        rust_string_literal(&capabilities)
    ));

    output.push_str("pub(super) const PROJECT_SOURCES: &[&str] = &[\n");
    for path in &project_sources {
        output.push_str(&format!(
            "    include_str!({}),\n",
            rust_string_literal(path)
        ));
    }
    output.push_str("];\n\n");

    output.push_str("pub(super) const WRITING_SOURCES: &[&str] = &[\n");
    for path in &writing_sources {
        output.push_str(&format!(
            "    include_str!({}),\n",
            rust_string_literal(path)
        ));
    }
    output.push_str("];\n");

    fs::write(output_path, output)?;
    Ok(())
}

fn markdown_files(directory: &Path) -> Result<Vec<PathBuf>, Box<dyn Error>> {
    let mut files = Vec::new();

    for entry in fs::read_dir(directory)? {
        let path = entry?.path();
        if path.extension().is_some_and(|extension| extension == "md") {
            files.push(path);
        }
    }

    files.sort();
    Ok(files)
}

fn rust_string_literal(path: &Path) -> String {
    format!("{:?}", path.to_string_lossy())
}
