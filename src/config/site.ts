export interface NavItem {
    href: string
    label: string
}

export const siteName = "edgarcnp.dev"

export const defaultDescription = "Software engineer building secure, pragmatic web systems."

export const tickerItems = ["Rust", "Dioxus", "Cloudflare"]

export const headerNav: NavItem[] = [
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
    { href: "/contact", label: "Contact" },
]

export const navIndex: NavItem[] = [{ href: "/", label: "Home" }, ...headerNav]
