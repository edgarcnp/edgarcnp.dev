import { Hono } from 'hono';
import type { APIContext } from 'astro';
import health from '../../api/health';
import news from '../../api/news';
import rss from '../../api/rss';

const app = new Hono().basePath('/api');

app.route('/', health);
app.route('/', news);
app.route('/', rss);

export const GET = ({ request }: APIContext) => app.fetch(request);
export const POST = ({ request }: APIContext) => app.fetch(request);
