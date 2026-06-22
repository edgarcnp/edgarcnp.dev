/**
 * Trusted Types policy for safe HTML injection.
 *
 * @remarks
 * - Policy name: "app" (whitelisted in the CSP trusted-types directive).
 * - On the client: creates a Trusted Types policy wrapping DOMPurify with the real browser window.
 * - On the server (SSR/Workers): globalThis.trustedTypes is undefined, so the policy is null.
 * - sanitize() returns TrustedHTML on the client, plain string on the server.
 * - DOMPurify is imported without linkedom — in the browser it uses the real window automatically.
 */

import DOMPurify from "dompurify"

const ALLOWED_TAGS = [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "strong", "em", "del", "mark",
    "table", "thead", "tbody", "tr", "th", "td",
    "dl", "dt", "dd",
    "figure", "figcaption",
    "sup", "sub",
]

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "width", "height"]

/** DOMPurify configuration shared between the policy and fallback paths. */
const SANITIZE_OPTIONS = {
    TRUSTED_TYPES_POLICY: null,
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
}

/**
 * Check if Trusted Types are available in the current environment.
 *
 * @returns True if the browser supports Trusted Types.
 */
function hasTrustedTypes(): boolean {
    return typeof globalThis !== "undefined" && "trustedTypes" in globalThis
}

interface TrustedTypesPolicy {
    createHTML(raw: string): string
    createScriptURL(raw: string): string
    createScript(raw: string): string
}

/** Create the Trusted Types policy if supported, null otherwise. */
const policy: TrustedTypesPolicy | null = (() => {
    if (!hasTrustedTypes()) return null
    // TODO: Revisit when Trusted Types API gets TypeScript typings (check @types/trusted-types)
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Trusted Types API not typed in all environments */
    const tt: any = (globalThis as any).trustedTypes
    return tt.createPolicy("app", {
        createHTML(raw: string): string {
            return DOMPurify.sanitize(raw, SANITIZE_OPTIONS)
        },
        createScriptURL(_raw: string): string {
            throw new Error("createScriptURL not implemented")
        },
        createScript(_raw: string): string {
            throw new Error("createScript not implemented")
        },
    }) as TrustedTypesPolicy
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
})()

/**
 * Sanitize an HTML string through the Trusted Types policy.
 *
 * @param raw - Untrusted HTML string.
 * @returns TrustedHTML (browser with TT) or sanitized string (SSR/fallback).
 *
 * @remarks
 * - On the client: returns TrustedHTML that satisfies innerHTML assignments.
 * - On the server: falls back to plain DOMPurify.sanitize() output.
 * - The allowlist matches content.ts: safe tags, safe attributes, no data attributes.
 */
export function sanitize(raw: string): string {
    if (policy) {
        return policy.createHTML(raw)
    }
    return DOMPurify.sanitize(raw, SANITIZE_OPTIONS)
}
