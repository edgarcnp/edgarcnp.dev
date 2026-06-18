export const STRIPE_WIDTH = 110;

export const GRADIENT = {
    bandWidth: 0.48,
    minStop: 0.14,
    maxStop: 0.96,
};

export const INTRO = {
    delay: 0,
    revealDuration: 840,
    idleBlendDuration: 500,
    stagger: 45,
    startCenter: 0.96,
    idleCenter: 0.5,
};

export const WAVE_SPEED_UP = {
    multiplier: 2.15,
    rampUpDuration: 140,
    waveDuration: 320,
    rampDownDuration: 480,
};

export const IDLE_WAVE = {
    speed: 0.42,
    stripePhase: 0.74,
    secondarySpeed: 0.26,
    secondaryStripePhase: 1.28,
    primaryAmplitude: 0.19,
    secondaryAmplitude: 0.055,
};

const FULL_CIRCLE = Math.PI * 2;

export type Stripe = {
    phase: number;
    secondaryPhase: number;
};

export type IntroAnimation = {
    startedAt: number;
};

type WaveSpeedUpValues = {
    multiplier: number;
    shineProgress: number;
};

export type WaveSpeedUpAnimation = {
    phase: "ramp-up";
    startedAt: number;
    duration: number;
    from: WaveSpeedUpValues;
} | {
    phase: "hold";
    startedAt: number;
} | {
    phase: "ramp-down";
    startedAt: number;
    from: WaveSpeedUpValues;
};

export type Size = {
    width: number;
    height: number;
    dpr: number;
};

export type GradientShimmerControls = {
    intro: () => void;
    emphasize: () => void;
};

export const gradientShimmerContext = Symbol("gradientShimmer");

type WaveSpeedUpAnimationState = WaveSpeedUpValues & {
    animation: WaveSpeedUpAnimation | null;
};

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const lerp = (start: number, end: number, progress: number) =>
    start + (end - start) * progress;
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = (value: number) => (
    value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2
);

export const getRandomWavePhase = () => Math.random() * FULL_CIRCLE;

export const readCssNumber = (
    styles: CSSStyleDeclaration,
    name: string,
) => {
    const rawValue = styles.getPropertyValue(name).trim();
    const value = Number(rawValue);

    if (!rawValue || !Number.isFinite(value)) {
        throw new Error(`Missing or invalid CSS number: ${name}`);
    }

    return value;
};

export const readCssString = (
    styles: CSSStyleDeclaration,
    name: string,
) => {
    const value = styles.getPropertyValue(name).trim();

    if (!value) {
        throw new Error(`Missing CSS value: ${name}`);
    }

    return value;
};

const createStripe = (index: number): Stripe => ({
    phase: index * IDLE_WAVE.stripePhase,
    secondaryPhase: index * IDLE_WAVE.secondaryStripePhase,
});

const getStripeCount = (canvasWidth: number) =>
    Math.max(1, Math.floor(canvasWidth / STRIPE_WIDTH));

const getRevealDelay = (
    index: number,
    stripeCount: number,
    stagger = INTRO.stagger,
) => {
    const centerIndex = (stripeCount - 1) / 2;
    const centerDistance = stripeCount % 2 === 0 ? 0.5 : 0;
    const distanceFromCenter = Math.abs(index - centerIndex) - centerDistance;

    return Math.max(0, distanceFromCenter) * stagger;
};

const getMaxRevealDelay = (stripeCount: number, stagger = INTRO.stagger) => {
    if (stripeCount <= 0) {
        return 0;
    }

    return Math.max(
        getRevealDelay(0, stripeCount, stagger),
        getRevealDelay(stripeCount - 1, stripeCount, stagger),
    );
};

const getStaggeredProgress = (
    time: number,
    startedAt: number,
    index: number,
    stripeCount: number,
    duration: number,
    stagger: number,
    delay = 0,
) => {
    const elapsed = time - startedAt - delay
        - getRevealDelay(index, stripeCount, stagger);

    return easeOutCubic(clamp(elapsed / duration));
};

export const getIntroRevealProgress = (
    time: number,
    introAnimation: IntroAnimation | null,
    index: number,
    stripeCount: number,
) => {
    if (!introAnimation) {
        return 1;
    }

    return getStaggeredProgress(
        time,
        introAnimation.startedAt,
        index,
        stripeCount,
        INTRO.revealDuration,
        INTRO.stagger,
        INTRO.delay,
    );
};

export const getIntroIdleProgress = (
    time: number,
    introAnimation: IntroAnimation | null,
    index: number,
    stripeCount: number,
) => {
    if (!introAnimation) {
        return 1;
    }

    const elapsed = time
        - introAnimation.startedAt
        - INTRO.delay
        - getRevealDelay(index, stripeCount)
        - INTRO.revealDuration;

    return easeOutCubic(clamp(elapsed / INTRO.idleBlendDuration));
};

export const isIntroComplete = (
    time: number,
    introAnimation: IntroAnimation | null,
    stripeCount: number,
) => {
    if (!introAnimation) {
        return true;
    }

    const completeAt = introAnimation.startedAt
        + INTRO.delay
        + getMaxRevealDelay(stripeCount)
        + INTRO.revealDuration
        + INTRO.idleBlendDuration;

    return time >= completeAt;
};

export const getIdleCenter = (
    stripe: Stripe,
    wavePhase: number,
    secondaryWavePhase: number,
) => {
    const primaryWave = Math.sin(wavePhase - stripe.phase);
    const secondaryWave = Math.sin(secondaryWavePhase + stripe.secondaryPhase);

    return 0.5
        + primaryWave * IDLE_WAVE.primaryAmplitude
        + secondaryWave * IDLE_WAVE.secondaryAmplitude;
};

export const syncStripeCount = (stripes: Stripe[], width: number) => {
    const count = getStripeCount(width);

    while (stripes.length < count) {
        stripes.push(createStripe(stripes.length));
    }

    stripes.length = count;

    return width / count;
};

export const resizeCanvas = (
    visibleCanvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
): Size => {
    const { width, height } = visibleCanvas.getBoundingClientRect();
    const dpr = globalThis.devicePixelRatio || 1;
    const cssWidth = Math.max(1, width);
    const cssHeight = Math.max(1, height);

    visibleCanvas.width = Math.ceil(cssWidth * dpr);
    visibleCanvas.height = Math.ceil(cssHeight * dpr);

    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { width: cssWidth, height: cssHeight, dpr };
};

export const snapToDevicePixel = (value: number, dpr: number) => Math.round(value * dpr) / dpr;

const IDLE_SPEED_UP: WaveSpeedUpValues = {
    multiplier: 1,
    shineProgress: 0,
};

const PEAK_SPEED_UP: WaveSpeedUpValues = {
    multiplier: WAVE_SPEED_UP.multiplier,
    shineProgress: 1,
};

const lerpSpeedUpValues = (
    from: WaveSpeedUpValues,
    to: WaveSpeedUpValues,
    progress: number,
): WaveSpeedUpValues => ({
    multiplier: lerp(from.multiplier, to.multiplier, progress),
    shineProgress: lerp(from.shineProgress, to.shineProgress, progress),
});

const getProgress = (time: number, startedAt: number, duration: number) =>
    clamp((time - startedAt) / duration);

const getSpeedUpRampUpDuration = (from: WaveSpeedUpValues) => {
    const multiplierRemaining = clamp(
        (WAVE_SPEED_UP.multiplier - from.multiplier)
            / (WAVE_SPEED_UP.multiplier - 1),
    );
    const shineRemaining = 1 - from.shineProgress;

    return Math.max(
        1,
        WAVE_SPEED_UP.rampUpDuration
            * Math.max(multiplierRemaining, shineRemaining),
    );
};

const isSpeedUpAtPeak = ({ multiplier, shineProgress }: WaveSpeedUpValues) =>
    multiplier >= WAVE_SPEED_UP.multiplier && shineProgress >= 1;

export const triggerSpeedUpAnimation = (
    time: number,
    speedUpAnimation: WaveSpeedUpAnimation | null,
): WaveSpeedUpAnimation => {
    const { multiplier, shineProgress } = updateSpeedUpAnimation(
        time,
        speedUpAnimation,
    );
    const from = { multiplier, shineProgress };

    if (isSpeedUpAtPeak(from)) {
        return {
            phase: "hold",
            startedAt: time,
        };
    }

    return {
        phase: "ramp-up",
        startedAt: time,
        duration: getSpeedUpRampUpDuration(from),
        from,
    };
};

export const updateSpeedUpAnimation = (
    time: number,
    speedUpAnimation: WaveSpeedUpAnimation | null,
): WaveSpeedUpAnimationState => {
    if (!speedUpAnimation) {
        return {
            animation: null,
            ...IDLE_SPEED_UP,
        };
    }

    if (speedUpAnimation.phase === "ramp-up") {
        const progress = getProgress(
            time,
            speedUpAnimation.startedAt,
            speedUpAnimation.duration,
        );
        const values = lerpSpeedUpValues(
            speedUpAnimation.from,
            PEAK_SPEED_UP,
            easeOutCubic(progress),
        );

        if (progress >= 1) {
            return {
                animation: {
                    phase: "hold",
                    startedAt: time,
                },
                ...values,
            };
        }

        return {
            animation: speedUpAnimation,
            ...values,
        };
    }

    if (speedUpAnimation.phase === "hold") {
        const progress = getProgress(
            time,
            speedUpAnimation.startedAt,
            WAVE_SPEED_UP.waveDuration,
        );

        if (progress >= 1) {
            return {
                animation: {
                    phase: "ramp-down",
                    startedAt: time,
                    from: PEAK_SPEED_UP,
                },
                ...PEAK_SPEED_UP,
            };
        }

        return {
            animation: speedUpAnimation,
            ...PEAK_SPEED_UP,
        };
    }

    const progress = getProgress(
        time,
        speedUpAnimation.startedAt,
        WAVE_SPEED_UP.rampDownDuration,
    );
    const values = lerpSpeedUpValues(
        speedUpAnimation.from,
        IDLE_SPEED_UP,
        easeInOutCubic(progress),
    );

    return {
        animation: progress >= 1 ? null : speedUpAnimation,
        ...values,
    };
};
