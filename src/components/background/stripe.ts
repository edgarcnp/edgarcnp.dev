import type { Stripe } from './types';
import { STRIPE_WIDTH, IDLE_WAVE } from './config';

const createStripe = (index: number): Stripe => ({
    phase: index * IDLE_WAVE.stripePhase,
    secondaryPhase: index * IDLE_WAVE.secondaryStripePhase,
});

const getStripeCount = (canvasWidth: number): number =>
    Math.max(1, Math.floor(canvasWidth / STRIPE_WIDTH));

export const syncStripeCount = (stripes: Stripe[], width: number): number => {
    const count = getStripeCount(width);

    while (stripes.length < count) {
        stripes.push(createStripe(stripes.length));
    }

    stripes.length = count;

    return width / count;
};
