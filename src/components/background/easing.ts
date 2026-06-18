export const clamp = (value: number, min = 0, max = 1): number =>
    Math.max(min, Math.min(max, value));

export const lerp = (start: number, end: number, progress: number): number =>
    start + (end - start) * progress;

export const easeOutCubic = (value: number): number => {
    const t = 1 - value;
    return 1 - t * t * t;
};

export const easeInOutCubic = (value: number): number => {
    if (value < 0.5) {
        return 4 * value * value * value;
    }
    const t = -2 * value + 2;
    return 1 - t * t * t / 2;
};
