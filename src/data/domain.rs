use std::fmt;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ProjectStatus {
    Planned,
    InProgress,
    Archived,
}

impl ProjectStatus {
    pub const ALL: [Self; 3] = [Self::Planned, Self::InProgress, Self::Archived];

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "Planned" => Some(Self::Planned),
            "In Progress" => Some(Self::InProgress),
            "Archived" => Some(Self::Archived),
            _ => None,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Planned => "Planned",
            Self::InProgress => "In Progress",
            Self::Archived => "Archived",
        }
    }

    pub(super) fn allowed_values() -> String {
        Self::ALL
            .iter()
            .map(|status| status.as_str())
            .collect::<Vec<_>>()
            .join(", ")
    }
}

impl fmt::Display for ProjectStatus {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ContactKind {
    Email,
    Code,
    Profile,
}

impl ContactKind {
    pub const ALL: [Self; 3] = [Self::Email, Self::Code, Self::Profile];

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "email" => Some(Self::Email),
            "code" => Some(Self::Code),
            "profile" => Some(Self::Profile),
            _ => None,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Email => "email",
            Self::Code => "code",
            Self::Profile => "profile",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Self::Email => "Email",
            Self::Code => "Code",
            Self::Profile => "Profile",
        }
    }

    pub(super) fn allowed_values() -> String {
        Self::ALL
            .iter()
            .map(|kind| kind.as_str())
            .collect::<Vec<_>>()
            .join(", ")
    }
}

impl fmt::Display for ContactKind {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.label())
    }
}

#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct IsoDate(String);

impl IsoDate {
    pub fn parse(field: &str, value: String) -> Result<Self, String> {
        if Self::is_valid_str(&value) {
            Ok(Self(value))
        } else {
            Err(format!("{field} must be a valid YYYY-MM-DD date: {value}"))
        }
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub(super) fn is_valid_str(value: &str) -> bool {
        let bytes = value.as_bytes();
        if bytes.len() != 10
            || !bytes[0..4].iter().all(u8::is_ascii_digit)
            || bytes[4] != b'-'
            || !bytes[5..7].iter().all(u8::is_ascii_digit)
            || bytes[7] != b'-'
            || !bytes[8..10].iter().all(u8::is_ascii_digit)
        {
            return false;
        }

        let Ok(year) = value[0..4].parse::<u16>() else {
            return false;
        };
        let Ok(month) = value[5..7].parse::<u8>() else {
            return false;
        };
        let Ok(day) = value[8..10].parse::<u8>() else {
            return false;
        };

        let max_day = match month {
            1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
            4 | 6 | 9 | 11 => 30,
            2 if is_leap_year(year) => 29,
            2 => 28,
            _ => return false,
        };

        (1..=max_day).contains(&day)
    }
}

impl fmt::Display for IsoDate {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

pub(super) fn validate_safe_link_href(value: &str) -> Result<(), String> {
    if has_forbidden_url_chars(value) {
        return Err("URL is empty or contains whitespace/control characters".to_string());
    }

    if is_safe_https_url(value) || is_safe_mailto_url(value) || is_safe_root_relative_url(value) {
        Ok(())
    } else {
        Err("URL must be HTTPS, mailto, or root-relative".to_string())
    }
}

pub(super) fn validate_safe_local_image_src(value: &str) -> Result<(), String> {
    if has_forbidden_url_chars(value) {
        return Err("image source is empty or contains whitespace/control characters".to_string());
    }

    if !is_safe_root_relative_url(value) || !value.starts_with("/assets/") {
        return Err("image source must be root-relative under /assets/".to_string());
    }

    let path = value.split(['?', '#']).next().unwrap_or(value);
    let lowercase_path = path.to_ascii_lowercase();
    let has_safe_extension = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"]
        .iter()
        .any(|extension| lowercase_path.ends_with(extension));

    if has_safe_extension {
        Ok(())
    } else {
        Err("image source must use an allowed image extension".to_string())
    }
}

fn is_leap_year(year: u16) -> bool {
    year.is_multiple_of(4) && !year.is_multiple_of(100) || year.is_multiple_of(400)
}

fn has_forbidden_url_chars(value: &str) -> bool {
    value.is_empty()
        || value.trim() != value
        || value.chars().any(|character| {
            character.is_control() || character.is_whitespace() || character == '\\'
        })
}

fn is_safe_https_url(value: &str) -> bool {
    let Some(rest) = value.strip_prefix("https://") else {
        return false;
    };
    let authority = rest.split(['/', '?', '#']).next().unwrap_or_default();

    !authority.is_empty()
        && !authority.contains('@')
        && !authority.starts_with('.')
        && !authority.ends_with('.')
        && !authority.starts_with(':')
}

fn is_safe_mailto_url(value: &str) -> bool {
    let Some(address) = value.strip_prefix("mailto:") else {
        return false;
    };

    !address.contains(['?', '#', '/'])
        && address.split('@').count() == 2
        && !address.starts_with('@')
        && !address.ends_with('@')
}

fn is_safe_root_relative_url(value: &str) -> bool {
    if !value.starts_with('/') || value.starts_with("//") {
        return false;
    }

    let path = value.split(['?', '#']).next().unwrap_or(value);
    let lowercase_path = path.to_ascii_lowercase();
    if lowercase_path.contains("%2e")
        || lowercase_path.contains("%2f")
        || lowercase_path.contains("%5c")
    {
        return false;
    }

    !path.split('/').any(|segment| segment == "..")
}
