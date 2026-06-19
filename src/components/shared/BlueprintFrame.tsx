import type { JSX } from 'solid-js';

interface Props {
  class?: string;
  children: JSX.Element;
}

export default function BlueprintFrame(props: Props) {
  return (
    <div class={`blueprint-frame ${props.class ?? ''}`}>
      {props.children}
    </div>
  );
}
