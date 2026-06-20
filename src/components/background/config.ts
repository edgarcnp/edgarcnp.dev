/**
 * Minimum stripe width in CSS pixels.
 *
 * @remarks Stripe count = `Math.floor(canvasWidth / STRIPE_WIDTH)`.
 *          Wider canvases get more stripes; narrower canvases get fewer.
 */
export const STRIPE_WIDTH = 110;

/**
 * Gradient band positioning constants for each stripe.
 *
 * @remarks
 * - `bandWidth`: Half-width of the highlight band as a fraction of the stripe (0.48 = 96% of stripe).
 * - `minStop`: Minimum clamped position for gradient stops (0.14).
 * - `maxStop`: Maximum clamped position for gradient stops (0.96).
 */
export const GRADIENT = {
    bandWidth: 0.48,
    minStop: 0.14,
    maxStop: 0.96,
} as const;

/**
 * Intro animation timing constants.
 *
 * @remarks
 * - `delay`: Initial delay before animation starts (0ms — immediate).
 * - `revealDuration`: Duration of each stripe's reveal animation (840ms).
 * - `idleBlendDuration`: Duration of the transition from intro to idle wave (500ms).
 * - `stagger`: Delay between each stripe's reveal (45ms — center stripes start first).
 * - `startCenter`: Initial vertical center position (0.96 — near bottom).
 * - `idleCenter`: Final idle vertical center position (0.5 — middle).
 */
export const INTRO = {
    delay: 0,
    revealDuration: 840,
    idleBlendDuration: 500,
    stagger: 45,
    startCenter: 0.96,
    idleCenter: 0.5,
} as const;

/**
 * Click-triggered speed-up animation constants.
 *
 * @remarks
 * - `multiplier`: Peak wave speed multiplier (2.15× at peak).
 * - `rampUpDuration`: Time to reach peak speed from idle (140ms).
 * - `waveDuration`: Time held at peak speed (320ms).
 * - `rampDownDuration`: Time to return to idle from peak (480ms).
 */
export const WAVE_SPEED_UP = {
    multiplier: 2.15,
    rampUpDuration: 140,
    waveDuration: 320,
    rampDownDuration: 480,
} as const;

/**
 * Idle wave motion constants — continuous subtle oscillation.
 *
 * @remarks
 * - `speed`: Primary wave angular speed (0.42 rad/ms).
 * - `stripePhase`: Phase offset between adjacent stripes for primary wave (0.74 rad).
 * - `secondarySpeed`: Secondary wave angular speed (0.26 rad/ms).
 * - `secondaryStripePhase`: Phase offset for secondary wave (1.28 rad).
 * - `primaryAmplitude`: Primary wave vertical amplitude (0.19 — 19% of stripe height).
 * - `secondaryAmplitude`: Secondary wave vertical amplitude (0.055 — 5.5% of stripe height).
 */
export const IDLE_WAVE = {
    speed: 0.42,
    stripePhase: 0.74,
    secondarySpeed: 0.26,
    secondaryStripePhase: 1.28,
    primaryAmplitude: 0.19,
    secondaryAmplitude: 0.055,
} as const;
