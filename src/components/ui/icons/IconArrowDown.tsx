import type { IconProps } from "~/lib/types";


export function IconArrowDown(props: IconProps) {
  return (
    <svg class={props.class} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </svg>
  );
}
