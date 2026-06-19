import type { Colors, Stripe, Size, IntroAnimation } from '~/lib/types';
import { GRADIENT, INTRO } from './config';
import { clamp, lerp } from './easing';
import { snapToDevicePixel } from './canvas';
import {
    getIntroRevealProgress,
    getIntroIdleProgress,
    getIdleCenter,
} from './intro';

export const createGrainPattern = (
    context: CanvasRenderingContext2D,
    colors: Colors,
): CanvasPattern | null => {
    const grainCanvas = document.createElement('canvas');
    const grainContext = grainCanvas.getContext('2d');

    if (!grainContext) return null;

    grainCanvas.width = 64;
    grainCanvas.height = 64;

    const imageData = grainContext.createImageData(64, 64);
    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
        const luminance = colors.grainLuminance + (Math.random() - 0.5) * colors.grainContrast;
        const redShift = (Math.random() - 0.5) * colors.grainSaturation;
        const greenShift = (Math.random() - 0.5) * colors.grainSaturation;
        const blueShift = (Math.random() - 0.5) * colors.grainSaturation;

        pixels[index] = clamp(luminance + redShift, 0, 255);
        pixels[index + 1] = clamp(luminance + greenShift, 0, 255);
        pixels[index + 2] = clamp(luminance + blueShift, 0, 255);
        pixels[index + 3] = 255;
    }

    grainContext.putImageData(imageData, 0, 0);

    return context.createPattern(grainCanvas, 'repeat');
};

export const drawGrain = (
    context: CanvasRenderingContext2D,
    pattern: CanvasPattern,
    size: Size,
    colors: Colors,
) => {
    context.save();
    context.globalAlpha = colors.grainAlpha;
    context.globalCompositeOperation = 'overlay';
    context.fillStyle = pattern;
    context.fillRect(0, 0, size.width, size.height);
    context.restore();
};

export const drawStripe = (
    context: CanvasRenderingContext2D,
    stripe: Stripe,
    index: number,
    stripeWidth: number,
    size: Size,
    colors: Colors,
    time: number,
    introAnimation: IntroAnimation | null,
    stripeCount: number,
    wavePhase: number,
    secondaryWavePhase: number,
    shineProgress: number,
    heightTop: number,
    heightBottom: number,
) => {
    const revealProgress = getIntroRevealProgress(time, introAnimation, index, stripeCount);
    const idleProgress = getIntroIdleProgress(time, introAnimation, index, stripeCount);
    const alpha = colors.introAlpha + (colors.alpha - colors.introAlpha) * idleProgress;
    const x = snapToDevicePixel(index * stripeWidth, size.dpr);
    const nextX = index === stripeCount - 1
        ? size.width
        : snapToDevicePixel((index + 1) * stripeWidth, size.dpr);
    const width = nextX - x;
    const introCenter = lerp(INTRO.startCenter, INTRO.idleCenter, revealProgress);
    const idleCenter = getIdleCenter(stripe, wavePhase, secondaryWavePhase);
    const center = introCenter + (idleCenter - introCenter) * idleProgress;
    const bandStart = clamp(center - GRADIENT.bandWidth, GRADIENT.minStop, GRADIENT.maxStop);
    const bandEnd = clamp(center + GRADIENT.bandWidth, GRADIENT.minStop, GRADIENT.maxStop);
    const gradient = context.createLinearGradient(x, heightTop, nextX, heightBottom);

    gradient.addColorStop(0, colors.highlight);
    gradient.addColorStop(bandStart, colors.start);
    gradient.addColorStop(center, colors.highlight);
    gradient.addColorStop(bandEnd, colors.start);
    gradient.addColorStop(1, colors.start);

    const gradientAlpha = clamp(alpha * (1 + shineProgress * colors.speedUpShineBoost)) * revealProgress;

    context.globalAlpha = gradientAlpha;
    context.fillStyle = gradient;
    context.fillRect(x, 0, width, size.height);
};
