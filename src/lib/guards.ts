import { AppError, CssError } from "./errors"

/**
 * Assert a value is not null or undefined.
 *
 * @param value - The value to check.
 * @param name  - Name of the value for the error message.
 * @returns The value if it's not null/undefined.
 *
 * @throws {CssError} If value is null or undefined.
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
