import type { IconProps } from "~/lib/types";


export function IconArrowUp(props: IconProps) {
  return (
    <svg class={props.class} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
