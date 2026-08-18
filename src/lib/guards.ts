import { CssError } from "./errors"

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
