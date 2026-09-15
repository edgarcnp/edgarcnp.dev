/** Refreshes the build-time contribution snapshot the homepage heatmap renders:
 *
 *   bun run contributions:sync
 *
 * Run by the daily Deploy workflow before the build, so the deployed calendar is
 * never more than a day old. The committed snapshot is what local builds read,
 * which keeps `astro build` hermetic — no network at build time. */

import { githubUser } from "../src/config/site"
import { fetchGithubContributions } from "../src/lib/github-contributions"

const OUTPUT = new URL("../src/data/contributions.json", import.meta.url)

const days = await fetchGithubContributions(githubUser)
const payload = { days: days.map(({ date, count }) => ({ date, count })) }

await Bun.write(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${days.length} days to ${OUTPUT.pathname}`)
