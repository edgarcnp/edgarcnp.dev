import { Hono } from 'hono';
import type { APIContext } from 'astro';

const app = new Hono().basePath('/api');

app.get('/news', (c) => {
  return c.json({ items: [] });
});

app.get('/rss', (c) => {
  return c.text('', 200, { 'Content-Type': 'application/rss+xml' });
});

export const GET = ({ request }: APIContext) => app.fetch(request);
export const POST = ({ request }: APIContext) => app.fetch(request);
