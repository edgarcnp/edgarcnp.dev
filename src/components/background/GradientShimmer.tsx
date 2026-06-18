import { onMount, onCleanup } from 'solid-js';
import type { Colors, Stripe, Size, IntroAnimation, GradientShimmerControls } from './types';
import { IDLE_WAVE } from './config';
import { syncStripeCount } from './stripe';
import { getRandomWavePhase, isIntroComplete } from './intro';
import { triggerSpeedUpAnimation, updateSpeedUpAnimation } from './speedup';
import { resizeCanvas, readCssNumber, readCssString } from './canvas';
import { createGrainPattern, drawGrain, drawStripe } from './draw';

let introPlayed = false;

type Props = {
    intro?: boolean;
    background?: boolean;
    class?: string;
};

export default function GradientShimmer(props: Props) {
    let canvas!: HTMLCanvasElement;
    let shimmerController: GradientShimmerControls | null = null;

    onMount(() => {
        const context = canvas.getContext('2d', {
            alpha: true,
            colorSpace: 'display-p3',
        });

        if (!context) return;

        const stripes: Stripe[] = [];
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        let size: Size = { width: 0, height: 0, dpr: 1 };
        let stripeWidth: number = 0;
        let colors: Colors = {
            alpha: 0,
            grainAlpha: 0,
            grainLuminance: 0,
            grainContrast: 0,
            grainSaturation: 0,
            introAlpha: 0,
            start: '',
            highlight: '',
            speedUpShineBoost: 0,
        };
        let grainPattern: CanvasPattern | null = null;
        let animationFrame: number | null = null;
        let resizeFrame: number | null = null;
        let introAnimation: IntroAnimation | null = null;
        let speedUpAnimation: ReturnType<typeof triggerSpeedUpAnimation> | null = null;
        let wavePhase = getRandomWavePhase();
        let secondaryWavePhase = -wavePhase * 0.7;
        let lastFrameTime: number | null = null;

        const cancelResizeFrame = () => {
            if (resizeFrame === null) return;
            cancelAnimationFrame(resizeFrame);
            resizeFrame = null;
        };

        const cancelAnimation = () => {
            if (animationFrame === null) return;
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        };

        const startIntro = () => {
            if (reducedMotionQuery.matches) {
                introAnimation = null;
                drawFrame(performance.now());
                return;
            }
            introAnimation = { startedAt: performance.now() };
        };

        const startWaveSpeedUp = () => {
            if (reducedMotionQuery.matches) {
                speedUpAnimation = null;
                drawFrame(performance.now());
                return;
            }
            const time = performance.now();
            speedUpAnimation = triggerSpeedUpAnimation(time, speedUpAnimation);
        };

        const controller: GradientShimmerControls = {
            intro: startIntro,
            emphasize: startWaveSpeedUp,
        };

        const readColors = () => {
            const styles = getComputedStyle(canvas);
            colors = {
                alpha: readCssNumber(styles, '--shimmer-alpha'),
                grainAlpha: readCssNumber(styles, '--shimmer-grain-alpha'),
                grainLuminance: readCssNumber(styles, '--shimmer-grain-luminance'),
                grainContrast: readCssNumber(styles, '--shimmer-grain-contrast'),
                grainSaturation: readCssNumber(styles, '--shimmer-grain-saturation'),
                introAlpha: readCssNumber(styles, '--shimmer-intro-alpha'),
                start: readCssString(styles, '--shimmer-start'),
                highlight: readCssString(styles, '--shimmer-highlight'),
                speedUpShineBoost: readCssNumber(styles, '--shimmer-speed-up-shine-boost'),
            };
            grainPattern = createGrainPattern(context, colors);
        };

        const applyResize = () => {
            size = resizeCanvas(canvas, context);
            stripeWidth = syncStripeCount(stripes, size.width);
            readColors();
        };

        const scheduleResize = () => {
            cancelResizeFrame();
            resizeFrame = requestAnimationFrame((time) => {
                applyResize();
                drawFrame(time);
            });
        };

        const drawFrame = (time: number) => {
            const reducedMotion = reducedMotionQuery.matches;
            const deltaSeconds = reducedMotion || lastFrameTime === null
                ? 0
                : Math.min((time - lastFrameTime) / 1000, 0.064);
            const speedUpState = updateSpeedUpAnimation(time, speedUpAnimation);
            const activeIntroAnimation = reducedMotion ? null : introAnimation;

            lastFrameTime = reducedMotion ? null : time;
            speedUpAnimation = reducedMotion ? null : speedUpState.animation;

            if (!reducedMotion) {
                wavePhase += IDLE_WAVE.speed * speedUpState.multiplier * deltaSeconds;
                secondaryWavePhase += IDLE_WAVE.secondarySpeed * speedUpState.multiplier * deltaSeconds;
            }

            context.globalAlpha = 1;
            context.clearRect(0, 0, size.width, size.height);

            const heightTop = size.height * -0.35;
            const heightBottom = size.height * 1.35;

            for (const [index, stripe] of stripes.entries()) {
                drawStripe(
                    context,
                    stripe,
                    index,
                    stripeWidth,
                    size,
                    colors,
                    time,
                    activeIntroAnimation,
                    stripes.length,
                    wavePhase,
                    secondaryWavePhase,
                    reducedMotion ? 0 : speedUpState.shineProgress,
                    heightTop,
                    heightBottom,
                );
            }

            if (grainPattern) {
                drawGrain(context, grainPattern, size, colors);
            }

            if (isIntroComplete(time, introAnimation, stripes.length)) {
                introAnimation = null;
            }
        };

        const draw = (time: number) => {
            animationFrame = null;
            drawFrame(time);
            if (!reducedMotionQuery.matches) {
                animationFrame = requestAnimationFrame(draw);
            }
        };

        const requestAnimation = () => {
            if (animationFrame !== null || reducedMotionQuery.matches) return;
            animationFrame = requestAnimationFrame(draw);
        };

        applyResize();

        const startAfterResize = () => {
            if (props.intro !== false && !introPlayed) {
                introPlayed = true;
                startIntro();
            }
        };

        if (size.width === 0 || size.height === 0) {
            const retryFrame = requestAnimationFrame(() => {
                applyResize();
                drawFrame(performance.now());
                startAfterResize();
            });

            onCleanup(() => cancelAnimationFrame(retryFrame));
        } else {
            startAfterResize();
        }

        shimmerController = controller;

        const resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(canvas);

        const scheduleColorRead = () => {
            cancelResizeFrame();
            resizeFrame = requestAnimationFrame((time) => {
                readColors();
                drawFrame(time);
            });
        };

        const themeObserver = new MutationObserver(scheduleColorRead);
        themeObserver.observe(document.documentElement, { attributes: true });

        const onRouteChange = () => {
            controller.emphasize();
        };

        const onClick = () => {
            controller.emphasize();
        };

        document.addEventListener('click', onClick);
        document.addEventListener('astro:after-swap', onRouteChange);

        const updateMotionPreference = () => {
            if (reducedMotionQuery.matches) {
                introAnimation = null;
                speedUpAnimation = null;
                cancelAnimation();
                drawFrame(performance.now());
                return;
            }
            lastFrameTime = null;
            requestAnimation();
        };

        colorSchemeQuery.addEventListener('change', scheduleColorRead);
        reducedMotionQuery.addEventListener('change', updateMotionPreference);

        updateMotionPreference();

        onCleanup(() => {
            if (shimmerController === controller) {
                shimmerController = null;
            }
            cancelAnimation();
            cancelResizeFrame();
            resizeObserver.disconnect();
            themeObserver.disconnect();
            document.removeEventListener('click', onClick);
            document.removeEventListener('astro:after-swap', onRouteChange);
            colorSchemeQuery.removeEventListener('change', scheduleColorRead);
            reducedMotionQuery.removeEventListener('change', updateMotionPreference);
        });
    });

    const classes = () => {
        const base = props.background ? `background ${props.class || ''}` : (props.class || '');
        return base.trim();
    };

    return (
        <canvas
            ref={canvas}
            class={classes()}
            aria-hidden="true"
        />
    );
}
