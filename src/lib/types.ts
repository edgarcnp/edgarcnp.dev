/**
 * Props accepted by all icon components.
 *
 * @remarks All icons inherit from this — only `class` is needed for styling.
 */
export interface IconProps {
  class?: string;
}

/**
 * Phase of a single gradient stripe in the shimmer animation.
 *
 * @remarks Each stripe has independent primary and secondary wave phases.
 */
export type Stripe = {
  phase: number;
  secondaryPhase: number;
};

/**
 * Timestamp when the intro animation started.
 *
 * @remarks Used to calculate staggered reveal progress for each stripe.
 */
export type IntroAnimation = {
  startedAt: number;
};

/**
 * Current values for the wave speed-up effect.
 *
 * @remarks
 * - `multiplier`: Wave speed multiplier (1 = idle, 2.15 = peak).
 * - `shineProgress`: Shine overlay opacity (0 = none, 1 = full).
 */
export type WaveSpeedUpValues = {
  multiplier: number;
  shineProgress: number;
};

/**
 * Three-phase speed-up animation state machine.
 *
 * @remarks
 * Phases: ramp-up → hold → ramp-down.
 * Each phase has a startedAt timestamp for progress calculation.
 * ramp-up and ramp-down carry `from` values for interpolation.
 */
export type WaveSpeedUpAnimation = {
  phase: "ramp-up";
  startedAt: number;
  duration: number;
  from: WaveSpeedUpValues;
} | {
  phase: "hold";
  startedAt: number;
} | {
  phase: "ramp-down";
  startedAt: number;
  from: WaveSpeedUpValues;
};

/**
 * Combined speed-up values and current animation state.
 *
 * @remarks Returned by `updateSpeedUpAnimation()` — carries both the current values and whether an animation is active.
 */
export type WaveSpeedUpAnimationState = WaveSpeedUpValues & {
  animation: WaveSpeedUpAnimation | null;
};

/**
 * Canvas dimensions including device pixel ratio.
 *
 * @remarks
 * - `width`/`height`: CSS logical pixels (not physical).
 * - `dpr`: Device pixel ratio (1 on non-Retina, 2 on Retina, etc.).
 */
export type Size = {
  width: number;
  height: number;
  dpr: number;
};

/**
 * External controls exposed by the GradientShimmer component.
 *
 * @remarks
 * - `intro()`: Trigger the intro animation (plays once per page load).
 * - `emphasize()`: Trigger the click speed-up effect.
 */
export type GradientShimmerControls = {
  intro: () => void;
  emphasize: () => void;
};

/**
 * All CSS custom property values read from the canvas element.
 *
 * @remarks
 * Read via `getComputedStyle(canvas).getPropertyValue('--shimmer-*')`.
 * Missing/invalid values throw CssError during init.
 */
export type Colors = {
  alpha: number;
  grainAlpha: number;
  grainLuminance: number;
  grainContrast: number;
  grainSaturation: number;
  introAlpha: number;
  start: string;
  highlight: string;
  speedUpShineBoost: number;
};

/**
 * Valid project statuses — matches the Zod enum in content.ts.
 *
 * @remarks Used by StatusBadge, ProjectCard, and project frontmatter validation.
 */
export type ProjectStatus = 'Planned' | 'In Progress' | 'Archived';

/**
 * Navigation link with a matcher function for active state detection.
 *
 * @remarks
 * - `href`: Route path.
 * - `label`: Display text.
 * - `match`: Function that returns true if the current path should highlight this link.
 */
export type NavLink = {
  href: string;
  label: string;
  match: (path: string) => boolean;
};

/**
 * Visual variant for LinkAction and similar interactive elements.
 *
 * @remarks Valid values: "primary" | "secondary" | "accent" | "warm-secondary".
 */
export type ActionVariant = 'primary' | 'secondary' | 'accent' | 'warm-secondary';

/**
 * Tailwind class strings for each action variant.
 *
 * @remarks Used by LinkAction and Button to apply consistent styling.
 */
export const ACTION_CLASSES: Record<ActionVariant, string> = {
  primary: 'inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--blueprint-accent)] px-5 text-sm font-semibold text-[#061016] outline-none transition hover:bg-[#8be6f5] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--blueprint-bg)]',
  secondary: 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-5 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent)] hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]',
  accent: 'inline-flex min-h-11 items-center justify-center rounded-sm bg-[rgba(94,214,238,0.08)] px-5 text-sm font-semibold text-[var(--blueprint-accent)] outline-none transition hover:bg-[rgba(94,214,238,0.14)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]',
  'warm-secondary': 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-5 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent-2)] hover:text-[var(--blueprint-accent-2)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]',
};

/**
 * Tailwind class strings for each project status badge.
 *
 * @remarks Used by StatusBadge component. Keys must match ProjectStatus values.
 */
export const STATUS_CLASSES: Record<string, string> = {
  'In Progress': 'blueprint-status blueprint-status-progress',
  Planned: 'blueprint-status blueprint-status-planned',
  Archived: 'blueprint-status blueprint-status-archived',
};
