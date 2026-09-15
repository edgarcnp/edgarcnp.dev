export interface NavItem {
    href: string
    label: string
}

export const siteName = "edgarcnp.dev"

export const defaultDescription = "Software engineer building secure, pragmatic web systems."

export const tickerItems = ["Rust", "Dioxus", "Cloudflare"]

/** GitHub account behind the homepage contribution heatmap. Read by the
 * snapshot script and by the component's link back to the profile. */
export const githubUser = "edgarcnp"

export const headerNav: NavItem[] = [
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
    { href: "/contact", label: "Contact" },
]

export const navIndex: NavItem[] = [{ href: "/", label: "Home" }, ...headerNav]
