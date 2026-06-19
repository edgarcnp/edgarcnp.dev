import type { Size } from '~/lib/types';

export const snapToDevicePixel = (value: number, dpr: number): number =>
    dpr === 1 ? Math.round(value) : Math.round(value * dpr) / dpr;

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

export const readCssNumber = (
    styles: CSSStyleDeclaration,
    name: string,
): number => {
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
): string => {
    const value = styles.getPropertyValue(name).trim();

    if (!value) {
        throw new Error(`Missing CSS value: ${name}`);
    }

    return value;
};
