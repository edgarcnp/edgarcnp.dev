export interface NavItem { href: string, label: string, match: (path: string) => boolean }

export const headerNav: NavItem[] = [
    { href: "/projects", label: "Projects", match: (path) => path === "/projects" || path.startsWith("/projects/") },
    { href: "/writings", label: "Writings", match: (path) => path === "/writings" || path.startsWith("/writings/") },
    { href: "/contact", label: "Contact", match: (path) => path === "/contact" },
]

export const navIndex: NavItem[] = [
    { href: "/", label: "Home", match: (path) => path === "/" },
    ...headerNav,
]
