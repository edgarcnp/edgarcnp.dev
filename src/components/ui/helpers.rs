pub(super) fn button_classes(
    primary: bool,
    transparent: bool,
    card: bool,
    selected: bool,
    circle: bool,
) -> &'static str {
    match (primary, transparent, card, selected, circle) {
        (true, _, false, false, false) => "ui-button primary",
        (true, _, false, true, false) => "ui-button primary selected",
        (true, _, false, false, true) => "ui-button primary circle",
        (true, _, false, true, true) => "ui-button primary selected circle",
        (_, true, false, false, false) => "ui-button transparent",
        (_, true, false, true, false) => "ui-button transparent selected",
        (_, true, false, false, true) => "ui-button transparent circle",
        (_, true, false, true, true) => "ui-button transparent selected circle",
        (_, _, true, false, false) => "ui-button card",
        (_, _, true, true, false) => "ui-button card selected",
        (_, _, true, false, true) => "ui-button card circle",
        (_, _, true, true, true) => "ui-button card selected circle",
        (_, _, false, false, false) => "ui-button",
        (_, _, false, true, false) => "ui-button selected",
        (_, _, false, false, true) => "ui-button circle",
        (_, _, false, true, true) => "ui-button selected circle",
    }
}

pub(super) fn input_classes(small: bool, disabled: bool) -> &'static str {
    match (small, disabled) {
        (true, true) => "ui-input-field small disabled",
        (true, false) => "ui-input-field small",
        (false, true) => "ui-input-field disabled",
        (false, false) => "ui-input-field",
    }
}

pub(super) fn dropdown_classes(disabled: bool) -> &'static str {
    if disabled {
        "ui-dropdown disabled"
    } else {
        "ui-dropdown"
    }
}

pub(super) fn checkbox_classes(disabled: bool) -> &'static str {
    if disabled {
        "ui-checkbox disabled"
    } else {
        "ui-checkbox"
    }
}

pub(super) fn join_classes(base: &str, extra: &str) -> String {
    if extra.trim().is_empty() {
        base.to_string()
    } else {
        format!("{base} {extra}")
    }
}

pub(super) fn width_style(width: &str) -> String {
    if width.trim().is_empty() {
        String::new()
    } else {
        format!("width: {width}")
    }
}

pub(super) fn size_style(width: &str, height: &str) -> String {
    match (width.trim().is_empty(), height.trim().is_empty()) {
        (true, true) => String::new(),
        (false, true) => format!("width: {width}"),
        (true, false) => format!("height: {height}"),
        (false, false) => format!("width: {width}; height: {height}"),
    }
}
