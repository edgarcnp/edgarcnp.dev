export function isActivePath(href: string, path: string): boolean {
    if (href === "/") return path === "/"
    return path === href || path.startsWith(`${href}/`)
}
