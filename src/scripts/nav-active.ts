const NAV_SELECTORS = ".nav-link, .mobile-menu-link"

const onDocumentClick = (event: MouseEvent): void => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as HTMLElement | null)?.closest<HTMLElement>(NAV_SELECTORS)
    if (!link) return
    if (link.getAttribute("aria-current") === "page") return
    document.querySelectorAll<HTMLElement>(NAV_SELECTORS).forEach((a) => a.removeAttribute("aria-current"))
    link.setAttribute("aria-current", "page")
}

document.addEventListener("click", onDocumentClick)
