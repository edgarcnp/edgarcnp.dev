export type Stripe = {
    phase: number;
    secondaryPhase: number;
};

export type IntroAnimation = {
    startedAt: number;
};

export type WaveSpeedUpValues = {
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

export type WaveSpeedUpAnimationState = WaveSpeedUpValues & {
    animation: WaveSpeedUpAnimation | null;
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

export type Colors = {
    alpha: number;
    grainAlpha: number;
    grainLuminance: number;
    grainContrast: number;
    grainSaturation: number;
    introAlpha: number;
    start: string;
    highlight: string;
    speedUpShineBoost: number;
};
