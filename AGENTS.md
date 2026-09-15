## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Structure

- Components group by domain: `site/` (page chrome), `content/` (collection-bound), `ui/` (generic primitives). Name components by purpose (`MenuButton`, `CapabilityGrid`), never by implementation (`Grid4`).
- One client script per feature in `src/scripts/`, named after the feature it powers (`theme.ts`, `mobile-menu.ts`, `page-curtains.ts`), with shared client helpers beside them (`lifecycle.ts`, `command-search.ts`). SPA lifecycle goes through `src/scripts/lifecycle.ts` (`onPageLoad`, `onBeforeSwap`) — never ad-hoc `window.__flags` or bare `astro:*` listeners. Bundled module scripts run once per page, so one-time setup lives at module scope; per-navigation work goes through `onPageLoad`.
- The motion engine lives in `src/scripts/motion/` (one effect per file in `effects/`); pages opt in with `data-motion="<effect>"`.
- Styles: DOM authored in `.astro` is styled in that component's scoped `<style>`; DOM created by JS is styled in `styles/<feature>.css` matching the script name. Shared vocabulary (type, card, pill, badge, buttons, page/section) lives in `styles/primitives.css`; tokens, reset, and reduced-motion in `tokens.css`, `base.css`, `motion.css`.
- Content entries are addressed by filename (`entry.id`); do not add a `slug` frontmatter field. Each JSON file in `src/data/` has its own collection — never a union schema over the directory. All content access goes through `src/lib/` (`content`, `data`, `commands`, `search`, `format`, `navigation`); `src/lib/search.ts` must stay client-safe (no `astro:content` imports).
- `ContributionHeatmap` exposes discrete options as props and continuous measurements (gap, radius, opacities, durations, separator colour) as documented CSS custom properties on the component — the strict CSP forbids inline `style` attributes, so per-element numbers cannot be props. Patterns and separators are driven by data attributes plus static attribute-selector rules; the client script only sets `--heatmap-delay` and the tooltip position via CSSOM.
- The homepage contribution heatmap (`ContributionHeatmap`) renders the committed build-time snapshot in `src/data/contributions.json`. Refresh it with `bun run contributions:sync` (`scripts/sync-contributions.ts`, which parses GitHub's public contributions page); the daily `.github/workflows/deploy.yml` syncs before building. Never fetch contributions at runtime — there is no Worker endpoint, and `astro build` must stay hermetic.
- Unit-test pure logic with `bun test` (`*.test.ts` next to the module). Verify with `bun run lint`, `bun run typecheck`, `bun run test`, `bun run build`; production HTML must contain no inline `<script>`/`<style>` (strict CSP).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
