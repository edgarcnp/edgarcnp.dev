import type {
    WaveSpeedUpAnimation,
    WaveSpeedUpAnimationState,
    WaveSpeedUpValues,
} from '~/lib/types';
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

/**
 * Interpolate between two speed-up value states.
 *
 * @param from     - Start values (multiplier, shineProgress).
 * @param to       - End values.
 * @param progress - Interpolation factor (0 = from, 1 = to).
 * @returns Interpolated speed-up values.
 */
const lerpSpeedUpValues = (
    from: WaveSpeedUpValues,
    to: WaveSpeedUpValues,
    progress: number,
): WaveSpeedUpValues => ({
    multiplier: lerp(from.multiplier, to.multiplier, progress),
    shineProgress: lerp(from.shineProgress, to.shineProgress, progress),
});

/**
 * Calculate normalized progress through an animation phase.
 *
 * @param time      - Current timestamp.
 * @param startedAt - Phase start timestamp.
 * @param duration  - Phase duration.
 * @returns Progress from 0 to 1, clamped.
 */
const getProgress = (time: number, startedAt: number, duration: number): number =>
    clamp((time - startedAt) / duration);

/**
 * Calculate the ramp-up duration based on how far the current state is from peak.
 *
 * @param from - Current speed-up values.
 * @returns Duration in milliseconds (minimum 1ms).
 *
 * @remarks If already at peak, returns 0. Otherwise scales the base ramp-up duration
 *          by the remaining distance to cover.
 */
const getSpeedUpRampUpDuration = (from: WaveSpeedUpValues): number => {
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

/**
 * Check if the current values are at or beyond peak speed-up.
 *
 * @param values - Current speed-up values.
 * @returns True if multiplier and shineProgress are both at maximum.
 */
const isSpeedUpAtPeak = ({ multiplier, shineProgress }: WaveSpeedUpValues): boolean =>
    multiplier >= WAVE_SPEED_UP.multiplier && shineProgress >= 1;

/**
 * Start a new speed-up animation from the current state.
 *
 * @param time              - Current animation timestamp.
 * @param speedUpAnimation  - Previous animation state, or null if idle.
 * @returns New WaveSpeedUpAnimation in ramp-up or hold phase.
 *
 * @remarks
 * If already at peak, transitions directly to hold.
 * Otherwise calculates the ramp-up duration based on remaining distance.
 * Chains: ramp-up → hold → ramp-down → idle.
 */
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

/**
 * Advance the speed-up animation by one frame.
 *
 * @param time              - Current animation timestamp.
 * @param speedUpAnimation  - Current animation state, or null if idle.
 * @returns Current speed-up values and updated animation state.
 *
 * @remarks
 * State machine: null → ramp-up → hold → ramp-down → null.
 * Each phase returns interpolated values for the current frame.
 * The animation property in the return value is null when idle (animation complete).
 */
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
