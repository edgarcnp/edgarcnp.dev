/**
 * Base class for all application errors.
 *
 * All typed errors extend this class. Catch `AppError` at route/API boundaries
 * to handle every error variant. Subclasses override `displayMessage` to provide
 * user-safe text that leaks no internal details.
 *
 * @param message - Debug message with full context (file paths, operation names).
 * @param cause   - Optional underlying error that caused this one.
 *
 * @remarks
 * - `this.name` is set to the subclass name automatically via `this.constructor.name`.
 * - `displayMessage` is safe for end users; `message` is for DevTools/console only.
 * - Subclasses: `ValidationError`, `NotFoundError`, `IoError`, `ParseError`, `CssError`, `DateError`.
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly cause?: Error,
    ) {
        super(message)
        this.name = this.constructor.name
    }

    /**
   * Returns a user-safe error message with no internal details.
   *
   * @returns Generic fallback string "Something went wrong".
   *
   * @remarks Override in subclasses to provide specific but safe messages.
   * This is what the ErrorBoundary displays to end users.
   */
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- polymorphic getter, overridden by subclasses
    get displayMessage(): string {
        return "Something went wrong"
    }
}

/**
 * Zod schema validation failed during data loading.
 *
 * Thrown when JSON data files (profile.json, contact.json, capabilities.json)
 * or markdown frontmatter fail schema validation.
 *
 * @param source  - File or data source that failed validation (e.g. "profile.json").
 * @param message - Semicolon-separated list of field-level validation errors.
 * @param issues  - Array of `{ path, message }` objects from Zod's safeParse.
 * @param cause   - Optional underlying error.
 *
 * @throws Never thrown directly; always thrown via `validate()` in data/schemas.ts.
 *
 * @remarks
 * - `issues` array is empty only for non-Zod validation failures.
 * - `displayMessage` shows "Invalid data in {source}" — safe for end users.
 * - Full `issues` array is available in DevTools for debugging.
 */
export class ValidationError extends AppError {
    constructor(
        public readonly source: string,
        message: string,
        public readonly issues: { path: string, message: string }[] = [],
        cause?: Error,
    ) {
        super(message, cause)
    }

    get displayMessage(): string {
        return `Invalid data in ${this.source}`
    }
}

/**
 * Requested resource doesn't exist.
 *
 * Thrown when a slug lookup (project or writing post) returns no match.
 *
 * @param resource - Type of resource (e.g. "project", "writing post").
 * @param id       - The slug or identifier that wasn't found.
 *
 * @throws `getProject(slug)` or `getWritingPost(slug)` in content.ts.
 *
 * @remarks
 * - `displayMessage` shows "{resource} not found" — safe for end users.
 * - Full message includes the slug for debugging.
 */
export class NotFoundError extends AppError {
    constructor(
        public readonly resource: string,
        public readonly id: string,
    ) {
        super(`${resource} not found: ${id}`)
    }

    get displayMessage(): string {
        return `${this.resource} not found`
    }
}

/**
 * File system operation failed (read, readdir, access).
 *
 * Thrown when `fs.readFile`, `fs.readdir`, or similar Node.js fs operations fail.
 *
 * @param operation - Description of the failed operation (e.g. "read file", "read directory").
 * @param path      - File system path that was being accessed.
 * @param cause     - Optional underlying Node.js error (ENOENT, EACCES, etc.).
 *
 * @throws `readMarkdownFiles()` and `parseMarkdown()` in content.ts.
 *
 * @remarks
 * - `displayMessage` shows "Failed to {operation}" — safe for end users.
 * - Full message includes the file path for debugging.
 * - Common causes: file deleted between access check and read, permissions changed.
 */
export class IoError extends AppError {
    constructor(
        public readonly operation: string,
        public readonly path: string,
        cause?: Error,
    ) {
        super(`Failed to ${operation}: ${path}`, cause)
    }

    get displayMessage(): string {
        return `Failed to ${this.operation}`
    }
}

/**
 * Markdown parsing or DOMPurify sanitization failed.
 *
 * Thrown when `marked.parse()` throws or DOMPurify returns empty output.
 *
 * @param source  - File being parsed (e.g. "projects/my-project.md").
 * @param message - Specific failure reason.
 * @param cause   - Optional underlying parse error.
 *
 * @throws `sanitizeMarkdown()` in content.ts.
 *
 * @remarks
 * - `displayMessage` shows "Failed to parse {source}" — safe for end users.
 * - Empty DOMPurify output is treated as a parse error (defensive — shouldn't happen with valid input).
 */
export class ParseError extends AppError {
    constructor(
        public readonly source: string,
        message: string,
        cause?: Error,
    ) {
        super(`Parse error in ${source}: ${message}`, cause)
    }

    get displayMessage(): string {
        return `Failed to parse ${this.source}`
    }
}

/**
 * CSS custom property is missing or invalid.
 *
 * Thrown by `readCssNumber`/`readCssString` when canvas shimmer CSS variables
 * are not defined on the canvas element.
 *
 * @param property - CSS custom property name (e.g. "--shimmer-alpha").
 * @param message  - Specific failure reason.
 *
 * @throws `readCssNumber()`, `readCssString()`, `assertDefined()`, `assertFiniteNumber()`, `assertNonEmpty()` in canvas.ts/errors.ts.
 *
 * @remarks
 * - `displayMessage` shows "Missing configuration: {property}" — safe for end users.
 * - Canvas gracefully degrades (no shimmer) when this is thrown during init.
 * - Common cause: CSS file not loaded or custom property removed.
 */
export class CssError extends AppError {
    constructor(
        public readonly property: string,
        message: string,
    ) {
        super(message)
    }

    get displayMessage(): string {
        return `Missing configuration: ${this.property}`
    }
}

/**
 * A date string couldn't be parsed.
 *
 * Thrown when `new Date(value).getTime()` returns NaN.
 *
 * @param value  - The unparseable date string.
 * @param source - Context identifying the field (e.g. "writing/my-post.md.published").
 *
 * @throws `parseDate()` in content.ts.
 *
 * @remarks
 * - `displayMessage` shows "Invalid date value" — safe for end users.
 * - The Zod schema only validates `z.string()`, not date format — this catches format issues at runtime.
 * - `Invalid Date` objects produce `NaN` from `.getTime()`, which this detects.
 */
export class DateError extends AppError {
    constructor(
        public readonly value: string,
        public readonly source: string,
    ) {
        super(`Invalid date "${value}" in ${source}`)
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- polymorphic getter, overridden by subclasses
    get displayMessage(): string {
        return "Invalid date value"
    }
}

/**
 * Assert a value is not null or undefined.
 *
 * @param value - The value to check.
 * @param name  - Name of the value for the error message (e.g. "--shimmer-alpha").
 * @returns The value if it's not null/undefined.
 *
 * @throws {CssError} If value is null or undefined.
 *
 * @remarks Used for CSS custom property reads and DOM element lookups.
 */
export function assertDefined<T>(value: T | null | undefined, name: string): T {
    if (value === null || value === undefined) {
        throw new CssError(name, `Missing required value: ${name}`)
    }
    return value
}

/**
 * Assert a string parses to a finite number.
 *
 * @param value - The string to parse.
 * @param name  - Name of the value for the error message.
 * @returns The parsed number.
 *
 * @throws {CssError} If the string is empty, NaN, Infinity, or -Infinity.
 *
 * @remarks Used for reading CSS custom properties like `--shimmer-alpha`.
 */
export function assertFiniteNumber(value: string, name: string): number {
    const num = Number(value)
    if (!value || !Number.isFinite(num)) {
        throw new CssError(name, `Missing or invalid CSS number: ${name}`)
    }
    return num
}

/**
 * Assert a string is non-empty.
 *
 * @param value - The string to check.
 * @param name  - Name of the value for the error message.
 * @returns The string if non-empty.
 *
 * @throws {CssError} If the string is empty or falsy.
 *
 * @remarks Used for reading CSS custom properties like `--shimmer-start`.
 */
export function assertNonEmpty(value: string, name: string): string {
    if (!value) {
        throw new CssError(name, `Missing CSS value: ${name}`)
    }
    return value
}

/**
 * Assert a DOM element exists and matches the expected tag.
 *
 * @param selector - CSS selector to query (e.g. "#app", "canvas").
 * @param tagName  - Expected HTML tag name (e.g. "canvas", "div").
 * @returns The matched element cast to the correct type.
 *
 * @throws {AppError} If element is missing or tag doesn't match.
 *
 * @remarks Uses `localName` comparison instead of `instanceof` for tag matching.
 */
export function assertElement<K extends keyof HTMLElementTagNameMap>(
    selector: string,
    tagName: K,
): HTMLElementTagNameMap[K] {
    const el = document.querySelector(selector)
    if (el?.localName !== tagName) {
        throw new AppError(`Missing required element: ${selector}`)
    }
    return el as HTMLElementTagNameMap[K]
}
