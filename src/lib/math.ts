/**
 * General-purpose math utilities.
 *
 * Pure functions with zero domain coupling.
 * Used across animation, canvas, and layout code.
 */

/**
 * Clamp a value between min and max bounds.
 *
 * @param value - The value to clamp.
 * @param min   - Minimum bound (default 0).
 * @param max   - Maximum bound (default 1).
 * @returns The clamped value.
 */
export const clamp = (value: number, min = 0, max = 1): number =>
    Math.max(min, Math.min(max, value))

/**
 * Linear interpolation between start and end values.
 *
 * @param start    - The start value.
 * @param end      - The end value.
 * @param progress - Interpolation factor (0 = start, 1 = end).
 * @returns The interpolated value.
 *
 * @remarks Progress is NOT clamped — clamp before calling if needed.
 */
export const lerp = (start: number, end: number, progress: number): number =>
    start + ((end - start) * progress)

/**
 * Decelerating ease-out curve (fast start, slow end).
 *
 * @param value - Input progress (0 to 1).
 * @returns Eased output (0 to 1).
 *
 * @remarks Cubic ease-out: `1 - (1-t)³`.
 */
export const easeOutCubic = (value: number): number => {
    const t = 1 - value
    return 1 - (t * (t * t))
}

/**
 * Smooth acceleration + deceleration curve.
 *
 * @param value - Input progress (0 to 1).
 * @returns Eased output (0 to 1).
 *
 * @remarks Cubic ease-in-out: symmetric S-curve.
 */
export const easeInOutCubic = (value: number): number => {
    if (value < 0.5) {
        return 4 * (value * (value * value))
    }
    const t = (-(2 * value)) + 2
    return 1 - ((t * (t * t)) / 2)
}

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
