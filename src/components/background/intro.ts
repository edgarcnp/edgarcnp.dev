import type { Stripe, IntroAnimation } from './types';
import { INTRO, IDLE_WAVE } from './config';
import { clamp, easeOutCubic } from './easing';

const FULL_CIRCLE = Math.PI * 2;

export const getRandomWavePhase = (): number => Math.random() * FULL_CIRCLE;

const getRevealDelay = (
    index: number,
    stripeCount: number,
    stagger: number = INTRO.stagger,
): number => {
    const centerIndex = (stripeCount - 1) / 2;
    const centerDistance = stripeCount % 2 === 0 ? 0.5 : 0;
    const distanceFromCenter = Math.abs(index - centerIndex) - centerDistance;

    return Math.max(0, distanceFromCenter) * stagger;
};

const getMaxRevealDelay = (stripeCount: number, stagger: number = INTRO.stagger): number => {
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
): number => {
    const elapsed = time - startedAt - delay
        - getRevealDelay(index, stripeCount, stagger);

    return easeOutCubic(clamp(elapsed / duration));
};

export const getIntroRevealProgress = (
    time: number,
    introAnimation: IntroAnimation | null,
    index: number,
    stripeCount: number,
): number => {
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
): number => {
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
): boolean => {
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
): number => {
    const primaryWave = Math.sin(wavePhase - stripe.phase);
    const secondaryWave = Math.sin(secondaryWavePhase + stripe.secondaryPhase);

    return 0.5
        + primaryWave * IDLE_WAVE.primaryAmplitude
        + secondaryWave * IDLE_WAVE.secondaryAmplitude;
};
