import { snapToDevicePixel, clamp, lerp } from "~/lib/math"
import { GRADIENT, INTRO } from "./config"
import { getIntroRevealProgress, getIntroIdleProgress, getIdleCenter } from "./intro"

import type { Colors, Stripe, Size, IntroAnimation } from "~/lib/types"

/**
 * Create a repeating 64×64 grain noise texture pattern.
 *
 * @param context - The canvas 2D rendering context.
 * @param colors  - Grain configuration (luminance, contrast, saturation).
 * @returns A repeating CanvasPattern, or null if the 2D context can't be obtained.
 *
 * @remarks
 * Generates random per-pixel luminance and color channel shifts.
 * The pattern is tiled across the canvas via `createPattern('repeat')`.
 * Returns null gracefully — the caller should skip grain drawing if null.
 */
export const createGrainPattern = (
    context: CanvasRenderingContext2D,
    colors: Colors,
): CanvasPattern | null => {
    const grainCanvas = document.createElement("canvas")
    const grainContext = grainCanvas.getContext("2d")

    if (!grainContext) return null

    grainCanvas.width = 64
    grainCanvas.height = 64

    const imageData = grainContext.createImageData(64, 64)
    const pixels = imageData.data

    for (let index = 0; index < pixels.length; index += 4) {
        const luminance = colors.grainLuminance + ((Math.random() - 0.5) * colors.grainContrast)
        const redShift = (Math.random() - 0.5) * colors.grainSaturation
        const greenShift = (Math.random() - 0.5) * colors.grainSaturation
        const blueShift = (Math.random() - 0.5) * colors.grainSaturation

        pixels[index] = clamp(luminance + redShift, 0, 255)
        pixels[index + 1] = clamp(luminance + greenShift, 0, 255)
        pixels[index + 2] = clamp(luminance + blueShift, 0, 255)
        pixels[index + 3] = 255
    }

    grainContext.putImageData(imageData, 0, 0)

    return context.createPattern(grainCanvas, "repeat")
}

/**
 * Overlay the grain noise pattern across the entire canvas.
 *
 * @param context - The canvas 2D rendering context.
 * @param pattern - The repeating grain pattern from `createGrainPattern()`.
 * @param size    - Canvas dimensions.
 * @param colors  - Grain alpha and compositing configuration.
 *
 * @remarks
 * Uses `globalCompositeOperation: 'overlay'` to blend grain with the gradient.
 * Saves and restores context state to avoid leaking globalAlpha.
 */
export const drawGrain = (
    context: CanvasRenderingContext2D,
    pattern: CanvasPattern,
    size: Size,
    colors: Colors,
) => {
    context.save()
    context.globalAlpha = colors.grainAlpha
    context.globalCompositeOperation = "overlay"
    context.fillStyle = pattern
    context.fillRect(0, 0, size.width, size.height)
    context.restore()
}

/**
 * Draw a single gradient stripe with wave distortion and intro animation.
 *
 * @param context          - The canvas 2D rendering context.
 * @param stripe           - Stripe phase data for idle wave computation.
 * @param index            - Stripe index (0-based) in the array.
 * @param stripeWidth      - Width of each stripe in CSS pixels.
 * @param size             - Canvas dimensions.
 * @param colors           - CSS custom property values (alpha, start, highlight, etc.).
 * @param time             - Current animation timestamp in milliseconds.
 * @param introAnimation   - Intro animation state, or null if intro has completed.
 * @param stripeCount      - Total number of stripes in the canvas.
 * @param wavePhase        - Current primary wave phase (radians).
 * @param secondaryWavePhase - Current secondary wave phase (radians).
 * @param shineProgress    - Shine overlay opacity (0 = none, 1 = full) during speed-up.
 * @param heightTop        - Top Y coordinate for the gradient (usually 0).
 * @param heightBottom     - Bottom Y coordinate for the gradient (usually size.height).
 *
 * @remarks
 * The gradient is a linear fill from the top-left to bottom-right of the stripe.
 * Each stripe has 5 color stops: highlight → start → highlight → start → start.
 * The highlight band center oscillates via idle wave + intro blend.
 * Alpha transitions from introAlpha to idle alpha over the intro blend duration.
 */
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
    const revealProgress = getIntroRevealProgress(time, introAnimation, index, stripeCount)
    const idleProgress = getIntroIdleProgress(time, introAnimation, index, stripeCount)
    const alpha = colors.introAlpha + ((colors.alpha - colors.introAlpha) * idleProgress)
    const x = snapToDevicePixel(index * stripeWidth, size.dpr)
    const nextX = index === stripeCount - 1
        ? size.width
        : snapToDevicePixel((index + 1) * stripeWidth, size.dpr)
    const width = nextX - x
    const introCenter = lerp(INTRO.startCenter, INTRO.idleCenter, revealProgress)
    const idleCenter = getIdleCenter(stripe, wavePhase, secondaryWavePhase)
    const center = introCenter + ((idleCenter - introCenter) * idleProgress)
    const bandStart = clamp(center - GRADIENT.bandWidth, GRADIENT.minStop, GRADIENT.maxStop)
    const bandEnd = clamp(center + GRADIENT.bandWidth, GRADIENT.minStop, GRADIENT.maxStop)
    const gradient = context.createLinearGradient(x, heightTop, nextX, heightBottom)

    gradient.addColorStop(0, colors.highlight)
    gradient.addColorStop(bandStart, colors.start)
    gradient.addColorStop(center, colors.highlight)
    gradient.addColorStop(bandEnd, colors.start)
    gradient.addColorStop(1, colors.start)

    const gradientAlpha = clamp((alpha * (1 + (shineProgress * colors.speedUpShineBoost))) * revealProgress)

    context.globalAlpha = gradientAlpha
    context.fillStyle = gradient
    context.fillRect(x, 0, width, size.height)
}
