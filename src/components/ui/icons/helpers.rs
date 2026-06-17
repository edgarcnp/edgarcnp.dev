pub(super) fn icon_class(class: &str) -> String {
    if class.trim().is_empty() {
        "ui-icon".to_string()
    } else {
        format!("ui-icon {class}")
    }
}
