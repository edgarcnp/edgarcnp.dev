export const clamp = (value: number, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));

export const lerp = (start: number, end: number, progress: number) =>
    start + (end - start) * progress;

export const easeOutCubic = (value: number) =>
    1 - Math.pow(1 - value, 3);

export const easeInOutCubic = (value: number) =>
    value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
