import type {
    WaveSpeedUpAnimation,
    WaveSpeedUpAnimationState,
    WaveSpeedUpValues,
} from './types';
import { WAVE_SPEED_UP } from './config';
import { clamp, lerp, easeOutCubic, easeInOutCubic } from './easing';

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
