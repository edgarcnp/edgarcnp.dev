/**
 * Typed error classes — every failure point in the app extends one of these.
 *
 * Rules:
 * - Every error carries context (what failed, why)
 * - User-safe message via `displayMessage` (no internal details)
 * - Debug-safe via `toString()` (full context for DevTools)
 * - instanceof checks for exhaustive handling at boundaries
 */

// ─── Base ──────────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /** Safe for end users — no internal details. */
  get displayMessage(): string {
    return "Something went wrong";
  }
}

// ─── Validation ────────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(
    public readonly source: string,
    message: string,
    public readonly issues: { path: string; message: string }[] = [],
    cause?: Error,
  ) {
    super(message, cause);
  }

  get displayMessage(): string {
    return `Invalid data in ${this.source}`;
  }
}

// ─── Not Found ─────────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(
    public readonly resource: string,
    public readonly id: string,
  ) {
    super(`${resource} not found: ${id}`);
  }

  get displayMessage(): string {
    return `${this.resource} not found`;
  }
}

// ─── IO ────────────────────────────────────────────────────────────────────

export class IoError extends AppError {
  constructor(
    public readonly operation: string,
    public readonly path: string,
    cause?: Error,
  ) {
    super(`Failed to ${operation}: ${path}`, cause);
  }

  get displayMessage(): string {
    return `Failed to ${this.operation}`;
  }
}

// ─── Parse ─────────────────────────────────────────────────────────────────

export class ParseError extends AppError {
  constructor(
    public readonly source: string,
    message: string,
    cause?: Error,
  ) {
    super(`Parse error in ${source}: ${message}`, cause);
  }

  get displayMessage(): string {
    return `Failed to parse ${this.source}`;
  }
}

// ─── CSS ───────────────────────────────────────────────────────────────────

export class CssError extends AppError {
  constructor(
    public readonly property: string,
    message: string,
  ) {
    super(message);
  }

  get displayMessage(): string {
    return `Missing configuration: ${this.property}`;
  }
}

// ─── Date ──────────────────────────────────────────────────────────────────

export class DateError extends AppError {
  constructor(
    public readonly value: string,
    public readonly source: string,
  ) {
    super(`Invalid date "${value}" in ${source}`);
  }

  get displayMessage(): string {
    return "Invalid date value";
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Assert a value is not null/undefined — throws CssError if missing. */
export function assertDefined<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new CssError(name, `Missing required value: ${name}`);
  }
  return value;
}

/** Assert a value is a finite number — throws CssError if not. */
export function assertFiniteNumber(value: string, name: string): number {
  const num = Number(value);
  if (!value || !Number.isFinite(num)) {
    throw new CssError(name, `Missing or invalid CSS number: ${name}`);
  }
  return num;
}

/** Assert a string is non-empty — throws CssError if empty. */
export function assertNonEmpty(value: string, name: string): string {
  if (!value) {
    throw new CssError(name, `Missing CSS value: ${name}`);
  }
  return value;
}

/** Assert a DOM element exists — throws AppError if missing. */
export function assertElement<K extends keyof HTMLElementTagNameMap>(
  selector: string,
  tagName: K,
): HTMLElementTagNameMap[K] {
  const el = document.querySelector(selector);
  if (!el || el.localName !== tagName) {
    throw new AppError(`Missing required element: ${selector}`);
  }
  return el as HTMLElementTagNameMap[K];
}
