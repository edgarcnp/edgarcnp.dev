import type { Size } from '~/lib/types';
import { assertFiniteNumber, assertNonEmpty } from '~/lib/errors';

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
    return assertFiniteNumber(styles.getPropertyValue(name).trim(), name);
};

export const readCssString = (
    styles: CSSStyleDeclaration,
    name: string,
): string => {
    return assertNonEmpty(styles.getPropertyValue(name).trim(), name);
};
