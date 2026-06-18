/// <reference types="astro/client" />

declare module '*.astro' {
  interface Props {
    [key: string]: unknown;
  }
}
