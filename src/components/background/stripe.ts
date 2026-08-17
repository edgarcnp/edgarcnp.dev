import type { Stripe } from "~/lib/types"
import { STRIPE_WIDTH, IDLE_WAVE } from "./config"

/**
 * Create a new stripe with phase offsets based on its index.
 *
 * @param index - Stripe index (0-based).
 * @returns Stripe object with primary and secondary wave phases.
 *
 * @remarks Phases are derived from `index × stripePhase` and `index × secondaryStripePhase`.
 */
const createStripe = (index: number): Stripe => ({
    phase: index * IDLE_WAVE.stripePhase,
    secondaryPhase: index * IDLE_WAVE.secondaryStripePhase,
})

/**
 * Calculate the number of stripes needed for a given canvas width.
 *
 * @param canvasWidth - Canvas width in CSS pixels.
 * @returns Stripe count (minimum 1).
 *
 * @remarks `Math.floor(canvasWidth / STRIPE_WIDTH)` — wider canvases get more stripes.
 */
const getStripeCount = (canvasWidth: number): number =>
    Math.max(1, Math.floor(canvasWidth / STRIPE_WIDTH))

/**
 * Synchronize the stripe array length to match the canvas width.
 *
 * @param stripes - Mutable array of Stripe objects (modified in place).
 * @param width   - Current canvas width in CSS pixels.
 * @returns Width of each individual stripe in CSS pixels.
 *
 * @remarks
 * Grows the array by appending new stripes if needed.
 * Truncates the array by setting `.length` if the canvas shrank.
 * Returns `width / count` — the uniform stripe width for this frame.
 */
export const syncStripeCount = (stripes: Stripe[], width: number): number => {
    const count = getStripeCount(width)

    while (stripes.length < count) {
        stripes.push(createStripe(stripes.length))
    }

    stripes.length = count

    return width / count
}
