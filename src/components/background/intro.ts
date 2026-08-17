import type { Stripe, IntroAnimation } from "~/lib/types"
import { INTRO, IDLE_WAVE } from "./config"
import { clamp, easeOutCubic } from "~/lib/math"

const FULL_CIRCLE = Math.PI * 2

/**
 * Generate a random starting phase for idle wave motion.
 *
 * @returns A random value between 0 and 2π radians.
 *
 * @remarks Called once per GradientShimmer mount to randomize the initial wave pattern.
 */
export const getRandomWavePhase = (): number => Math.random() * FULL_CIRCLE

/**
 * Calculate the stagger delay for a specific stripe during intro animation.
 *
 * @param index       - Stripe index (0-based).
 * @param stripeCount - Total number of stripes.
 * @param stagger     - Delay per unit distance from center (default: INTRO.stagger).
 * @returns Delay in milliseconds before this stripe starts its reveal.
 *
 * @remarks Center stripes reveal first; outer stripes follow with increasing delay.
 */
const getRevealDelay = (
    index: number,
    stripeCount: number,
    stagger: number = INTRO.stagger,
): number => {
    const centerIndex = (stripeCount - 1) / 2
    const centerDistance = stripeCount % 2 === 0 ? 0.5 : 0
    const distanceFromCenter = Math.abs(index - centerIndex) - centerDistance

    return Math.max(0, distanceFromCenter) * stagger
}

/**
 * Calculate the maximum reveal delay across all stripes.
 *
 * @param stripeCount - Total number of stripes.
 * @param stagger     - Delay per unit distance (default: INTRO.stagger).
 * @returns Maximum delay in milliseconds.
 *
 * @remarks Used to determine when the entire intro animation is complete.
 */
const getMaxRevealDelay = (stripeCount: number, stagger: number = INTRO.stagger): number => {
    if (stripeCount <= 0) {
        return 0
    }

    return Math.max(
        getRevealDelay(0, stripeCount, stagger),
        getRevealDelay(stripeCount - 1, stripeCount, stagger),
    )
}

/**
 * Compute staggered progress for a single stripe.
 *
 * @param time         - Current animation timestamp.
 * @param startedAt    - When the intro animation started.
 * @param index        - Stripe index.
 * @param stripeCount  - Total number of stripes.
 * @param duration     - Duration of the animation phase.
 * @param stagger      - Delay per unit distance.
 * @param delay        - Initial delay before any stripe starts (default 0).
 * @returns Progress value from 0 to 1.
 *
 * @remarks Accounts for per-stripe stagger delay and applies easeOutCubic.
 */
const getStaggeredProgress = (
    time: number,
    startedAt: number,
    index: number,
    stripeCount: number,
    duration: number,
    stagger: number,
    delay = 0,
): number => {
    const elapsed = time - startedAt - delay - getRevealDelay(index, stripeCount, stagger)

    return easeOutCubic(clamp(elapsed / duration))
}

/**
 * Get the reveal progress (0→1) for a stripe during the intro animation.
 *
 * @param time            - Current animation timestamp.
 * @param introAnimation  - Intro animation state, or null if intro has completed.
 * @param index           - Stripe index.
 * @param stripeCount     - Total number of stripes.
 * @returns Progress value from 0 (hidden) to 1 (fully revealed).
 *
 * @remarks Returns 1 immediately if no intro animation is active.
 */
export const getIntroRevealProgress = (
    time: number,
    introAnimation: IntroAnimation | null,
    index: number,
    stripeCount: number,
): number => {
    if (!introAnimation) {
        return 1
    }

    return getStaggeredProgress(
        time,
        introAnimation.startedAt,
        index,
        stripeCount,
        INTRO.revealDuration,
        INTRO.stagger,
        INTRO.delay,
    )
}

/**
 * Get the idle blend progress (0→1) — transition from intro to idle wave.
 *
 * @param time            - Current animation timestamp.
 * @param introAnimation  - Intro animation state, or null if intro has completed.
 * @param index           - Stripe index.
 * @param stripeCount     - Total number of stripes.
 * @returns Progress value from 0 (still in intro) to 1 (fully idle).
 *
 * @remarks Returns 1 immediately if no intro animation is active.
 */
export const getIntroIdleProgress = (
    time: number,
    introAnimation: IntroAnimation | null,
    index: number,
    stripeCount: number,
): number => {
    if (!introAnimation) {
        return 1
    }

    const elapsed = time - introAnimation.startedAt - INTRO.delay - getRevealDelay(index, stripeCount) - INTRO.revealDuration

    return easeOutCubic(clamp(elapsed / INTRO.idleBlendDuration))
}

/**
 * Check if the full intro animation (all stripes) has finished.
 *
 * @param time            - Current animation timestamp.
 * @param introAnimation  - Intro animation state, or null if intro has completed.
 * @param stripeCount     - Total number of stripes.
 * @returns True if all stripes have completed their reveal and idle blend.
 *
 * @remarks Checks against the maximum reveal delay to determine if the entire animation is done.
 */
export const isIntroComplete = (
    time: number,
    introAnimation: IntroAnimation | null,
    stripeCount: number,
): boolean => {
    if (!introAnimation) {
        return true
    }

    const completeAt = introAnimation.startedAt + INTRO.delay + getMaxRevealDelay(stripeCount) + INTRO.revealDuration + INTRO.idleBlendDuration

    return time >= completeAt
}

/**
 * Compute the vertical center (0→1) of a stripe from dual sine waves.
 *
 * @param stripe             - Stripe phase data.
 * @param wavePhase          - Current primary wave phase (radians).
 * @param secondaryWavePhase - Current secondary wave phase (radians).
 * @returns Vertical center position as a fraction of the canvas height.
 *
 * @remarks
 * Combines two sine waves with different amplitudes and speeds:
 * - Primary: amplitude 0.19, speed 0.42, phase offset 0.74 per stripe.
 * - Secondary: amplitude 0.055, speed 0.26, phase offset 1.28 per stripe.
 * Result oscillates around 0.5 (vertical center).
 */
export const getIdleCenter = (
    stripe: Stripe,
    wavePhase: number,
    secondaryWavePhase: number,
): number => {
    const primaryWave = Math.sin(wavePhase - stripe.phase)
    const secondaryWave = Math.sin(secondaryWavePhase + stripe.secondaryPhase)

    return 0.5 + (primaryWave * IDLE_WAVE.primaryAmplitude) + (secondaryWave * IDLE_WAVE.secondaryAmplitude)
}
