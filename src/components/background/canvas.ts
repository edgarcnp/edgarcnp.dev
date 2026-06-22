import type { Size } from "~/lib/types"
import { assertFiniteNumber, assertNonEmpty } from "~/lib/errors"

/**
 * Round a value to the nearest device pixel boundary.
 *
 * @param value - The value to round (in CSS pixels).
 * @param dpr   - Device pixel ratio (1, 2, 3, etc.).
 * @returns The rounded value.
 *
 * @remarks
 * On non-Retina (dpr=1): standard `Math.round()`.
 * On Retina (dpr>1): round to physical pixel, convert back to CSS pixels.
 * Prevents sub-pixel rendering artifacts that cause blurry lines.
 */
export const snapToDevicePixel = (value: number, dpr: number): number =>
    dpr === 1 ? Math.round(value) : Math.round(value * dpr) / dpr

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
