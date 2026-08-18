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
 * - Subclass: `CssError`.
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
 * CSS custom property is missing or invalid.
 *
 * Thrown by `readCssNumber`/`readCssString` when canvas shimmer CSS variables
 * are not defined on the canvas element.
 *
 * @param property - CSS custom property name (e.g. "--shimmer-alpha").
 * @param message  - Specific failure reason.
 *
 * @throws `readCssNumber()`, `readCssString()`, `assertFiniteNumber()`, `assertNonEmpty()` in canvas.ts/guards.ts.
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
