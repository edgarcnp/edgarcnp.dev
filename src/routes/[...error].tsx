import { useLocation, useSearchParams } from "@solidjs/router"
import { LinkAction } from "~/components/ui/static/LinkAction"
import { useMeta } from "~/lib/meta"

/** Maximum path length to display — prevents XSS via long URLs. */
const MAX_PATH_LENGTH = 120

/**
 * RFC 9110 status code → human-readable title mapping.
 *
 * @remarks Covers 4xx client errors (400-451) and 5xx server errors (500-511).
 */
const titles: Record<number, string> = {
    400: "Bad request",
    401: "Unauthorized",
    402: "Payment required",
    403: "Forbidden",
    404: "Not found",
    405: "Method not allowed",
    406: "Not acceptable",
    407: "Proxy authentication required",
    408: "Request timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length required",
    412: "Precondition failed",
    413: "Content too large",
    414: "URI too long",
    415: "Unsupported media type",
    416: "Range not satisfiable",
    417: "Expectation failed",
    418: "I'm a teapot",
    421: "Misdirected request",
    422: "Unprocessable content",
    423: "Locked",
    424: "Failed dependency",
    425: "Too early",
    426: "Upgrade required",
    428: "Precondition required",
    429: "Too many requests",
    431: "Request header fields too large",
    451: "Unavailable for legal reasons",
    500: "Internal server error",
    501: "Not implemented",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout",
    505: "HTTP version not supported",
    506: "Variant also negotiates",
    507: "Insufficient storage",
    508: "Loop detected",
    510: "Not extended",
    511: "Network authentication required",
}

/**
 * Catch-all error page for unmatched routes.
 *
 * @remarks
 * - Reads `status` from search params (defaults to 404).
 * - Reads `path` from search params or falls back to `location.pathname`.
 * - Path is capped at 120 characters to prevent XSS via long URLs.
 * - Displays RFC 9110 status title and navigation links.
 */
export default function NotFound() {
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const meta = useMeta(() => ({ title: "Error", path: location.pathname }))
    const path = () => {
        const raw = (Array.isArray(searchParams.path) ? searchParams.path[0] : searchParams.path) ?? location.pathname
        return raw.length > MAX_PATH_LENGTH ? (raw.slice(0, MAX_PATH_LENGTH) + "…") : raw
    }
    const status = () => Number(searchParams.status) || 404
    const title = () => titles[status()] || "Something went wrong"

    return (
        <section class="blueprint-frame max-w-2xl space-y-5 p-5 sm:p-6">
            <meta.Title />
            <meta.Meta />
            <p class="blueprint-label">Error / {status()}</p>
            <h1 class="text-3xl font-semibold text-(--blueprint-text) sm:text-4xl">{title()}</h1>
            <p class="leading-7 text-(--blueprint-muted)">
                The requested path{" "}
                <code class="rounded-sm bg-[rgba(244,247,251,0.06)] px-1.5 py-0.5 text-(--blueprint-accent-2)">{path()}</code>{" "}
                is not available.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row">
                <LinkAction href="/" variant="primary">Return home</LinkAction>
                <LinkAction href="/projects" variant="secondary">View projects</LinkAction>
            </div>
        </section>
    )
}
