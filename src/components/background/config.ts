export const STRIPE_WIDTH = 110;

export const GRADIENT = {
    bandWidth: 0.48,
    minStop: 0.14,
    maxStop: 0.96,
} as const;

export const INTRO = {
    delay: 0,
    revealDuration: 840,
    idleBlendDuration: 500,
    stagger: 45,
    startCenter: 0.96,
    idleCenter: 0.5,
} as const;

export const WAVE_SPEED_UP = {
    multiplier: 2.15,
    rampUpDuration: 140,
    waveDuration: 320,
    rampDownDuration: 480,
} as const;

export const IDLE_WAVE = {
    speed: 0.42,
    stripePhase: 0.74,
    secondarySpeed: 0.26,
    secondaryStripePhase: 1.28,
    primaryAmplitude: 0.19,
    secondaryAmplitude: 0.055,
} as const;
