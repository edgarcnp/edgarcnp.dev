// --- UI Icon Types ---

export interface IconProps {
  class?: string;
}

// --- Background Types ---

export type Stripe = {
  phase: number;
  secondaryPhase: number;
};

export type IntroAnimation = {
  startedAt: number;
};

export type WaveSpeedUpValues = {
  multiplier: number;
  shineProgress: number;
};

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

export type WaveSpeedUpAnimationState = WaveSpeedUpValues & {
  animation: WaveSpeedUpAnimation | null;
};

export type Size = {
  width: number;
  height: number;
  dpr: number;
};

export type GradientShimmerControls = {
  intro: () => void;
  emphasize: () => void;
};

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

// --- Data Types ---

export type ProjectStatus = 'Planned' | 'In Progress' | 'Archived';

export type NavLink = {
  href: string;
  label: string;
  match: (path: string) => boolean;
};

export type ActionVariant = 'primary' | 'secondary' | 'accent' | 'warm-secondary';

export const ACTION_CLASSES: Record<ActionVariant, string> = {
  primary: 'inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--blueprint-accent)] px-5 text-sm font-semibold text-[#061016] outline-none transition hover:bg-[#8be6f5] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--blueprint-bg)]',
  secondary: 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-5 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent)] hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]',
  accent: 'inline-flex min-h-11 items-center justify-center rounded-sm bg-[rgba(94,214,238,0.08)] px-5 text-sm font-semibold text-[var(--blueprint-accent)] outline-none transition hover:bg-[rgba(94,214,238,0.14)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]',
  'warm-secondary': 'inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--blueprint-line-muted)] px-5 text-sm font-semibold text-[var(--blueprint-text)] outline-none transition hover:border-[var(--blueprint-accent-2)] hover:text-[var(--blueprint-accent-2)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]',
};

export const STATUS_CLASSES: Record<string, string> = {
  'In Progress': 'blueprint-status blueprint-status-progress',
  Planned: 'blueprint-status blueprint-status-planned',
  Archived: 'blueprint-status blueprint-status-archived',
};
