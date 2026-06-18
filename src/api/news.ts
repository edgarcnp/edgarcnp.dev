import { Hono } from 'hono';

const news = new Hono();

news.get('/news', (c) => {
  return c.json({ items: [] });
});

export default news;
