import type { Size } from "~/lib/types"
import { assertFiniteNumber, assertNonEmpty } from "~/lib/guards"

/**
 * Resize the canvas buffer to match its display size × DPR.
 *
 * @param visibleCanvas - The canvas DOM element.
 * @param context       - The 2D rendering context.
 * @returns Logical dimensions (CSS pixels) and DPR.
 *
 * @remarks
 * Sets `canvas.width`/`canvas.height` to physical pixels.
 * Applies DPR transform so drawing commands use CSS coordinates.
 * Minimum 1×1 pixel to avoid zero-size canvas errors.
 */
export const resizeCanvas = (
    visibleCanvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
): Size => {
    const { width, height } = visibleCanvas.getBoundingClientRect()
    const dpr = globalThis.devicePixelRatio || 1
    const cssWidth = Math.max(1, width)
    const cssHeight = Math.max(1, height)

    visibleCanvas.width = Math.ceil(cssWidth * dpr)
    visibleCanvas.height = Math.ceil(cssHeight * dpr)

    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    return { width: cssWidth, height: cssHeight, dpr }
}

/**
 * Read a CSS custom property as a finite number.
 *
 * @param styles - Computed style object from `getComputedStyle()`.
 * @param name   - CSS custom property name (e.g. "--shimmer-alpha").
 * @returns The parsed number.
 *
 * @throws {CssError} If the property is missing, empty, or doesn't parse to a finite number.
 *
 * @remarks Used to read canvas shimmer configuration from CSS.
 */
export const readCssNumber = (
    styles: CSSStyleDeclaration,
    name: string,
): number => {
    return assertFiniteNumber(styles.getPropertyValue(name).trim(), name)
}

/**
 * Read a CSS custom property as a non-empty string.
 *
 * @param styles - Computed style object from `getComputedStyle()`.
 * @param name   - CSS custom property name (e.g. "--shimmer-start").
 * @returns The trimmed string value.
 *
 * @throws {CssError} If the property is missing or empty.
 *
 * @remarks Used to read color values for the canvas shimmer.
 */
export const readCssString = (
    styles: CSSStyleDeclaration,
    name: string,
): string => {
    return assertNonEmpty(styles.getPropertyValue(name).trim(), name)
}
