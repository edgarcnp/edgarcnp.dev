import type { JSX } from 'solid-js';
import { A } from '@solidjs/router';
import type { ActionVariant } from '~/lib/types';
import { ACTION_CLASSES } from '~/lib/types';

interface Props {
  href: string;
  external?: boolean;
  variant?: ActionVariant;
  children: JSX.Element;
}

export function LinkAction(props: Props) {
  const isExternal = () => props.external || props.href.startsWith('http') || props.href.startsWith('mailto:');

  return (
    <A
      href={props.href}
      target={isExternal() ? '_blank' : undefined}
      rel={isExternal() ? 'noopener noreferrer' : undefined}
      class={ACTION_CLASSES[props.variant ?? 'secondary']}
    >
      {props.children}
    </A>
  );
}
