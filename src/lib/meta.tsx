import { Meta, Title } from "@solidjs/meta";
import { getRequestURL } from "@solidjs/start/http";

const DEFAULT_DESCRIPTION = "Software engineer building secure, pragmatic web systems.";

function getOrigin(): string {
  if (typeof window === "undefined") {
    try {
      const url = getRequestURL();
      if (url) return `${url.protocol}//${url.host}`;
    } catch {}
    return "";
  }
  const el = document.querySelector('meta[name="site-origin"]');
  if (el) return el.getAttribute("content") ?? "";
  return window.location.origin;
}

interface MetaOptions {
  title?: string;
  description?: string;
  path?: string;
}

export function useMeta(options: () => MetaOptions) {
  const origin = () => getOrigin();
  const url = () => `${origin()}${options().path ?? ""}`;
  const siteName = () => {
    try {
      return new URL(origin()).hostname;
    } catch {
      return "";
    }
  };
  const title = () => {
    const o = options();
    const name = siteName();
    if (!o.title) return name;
    return o.title === name ? o.title : `${o.title} — ${name}`;
  };
  const description = () => options().description ?? DEFAULT_DESCRIPTION;

  return {
    Title: () => <Title>{title()}</Title>,
    Meta: () => (
      <>
        <Meta name="description" content={description()} />
        <link rel="canonical" href={url()} />
      </>
    ),
  };
}
