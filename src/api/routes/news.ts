import { Hono } from "hono"

/**
 * News feed API route — mounted at `/api/news`.
 *
 * @returns JSON response with `{ items: [] }` (placeholder).
 *
 * @remarks Placeholder endpoint — will be populated with news items in the future.
 */
const news = new Hono()

news.get("/", (c) => {
    return c.json({ items: [] })
})

export { news }
