import type { JSX } from 'solid-js';
import type { ActionVariant } from '~/lib/types';
import { ACTION_CLASSES } from '~/lib/types';

interface Props {
  href: string;
  external?: boolean;
  variant?: ActionVariant;
  children: JSX.Element;
}

export function LinkAction(props: Props) {
  return (
    <a
      href={props.href}
      target={props.external ? '_blank' : undefined}
      rel={props.external ? 'noopener noreferrer' : undefined}
      class={ACTION_CLASSES[props.variant ?? 'secondary']}
    >
      {props.children}
    </a>
  );
}
