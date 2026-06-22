import fs from "node:fs/promises"
import path from "node:path"

const SITE_URL = "https://edgarcnp.dev"

function escapeXml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

async function readSlugs(subdir: string): Promise<string[]> {
    const dir = path.join(process.cwd(), "src", "content", subdir)
    try {
        await fs.access(dir)
    } catch {
        return []
    }
    const entries = await fs.readdir(dir)
    return entries.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""))
}

async function main() {
    const projectSlugs = await readSlugs("projects")
    const writingSlugs = await readSlugs("writing")

    const urls = [
        { loc: "/", priority: "1.0" },
        { loc: "/projects", priority: "0.8" },
        { loc: "/writings", priority: "0.8" },
        { loc: "/contact", priority: "0.6" },
        ...projectSlugs.map((slug) => ({ loc: `/projects/${slug}`, priority: "0.7" })),
        ...writingSlugs.map((slug) => ({ loc: `/writings/${slug}`, priority: "0.7" })),
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${escapeXml(SITE_URL + u.loc)}</loc><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`

    const outDir = path.join(process.cwd(), ".output", "public")
    await fs.mkdir(outDir, { recursive: true })
    await fs.writeFile(path.join(outDir, "sitemap.xml"), xml, "utf-8")
    console.log(`[sitemap] Generated sitemap.xml with ${urls.length} URLs`)
}

main().catch((err: unknown) => {
    console.error("[sitemap] Failed to generate:", err)
    process.exit(1)
})
