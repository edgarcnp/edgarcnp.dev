interface Props {
  label: string;
}

export default function TechTag(props: Props) {
  return (
    <span class="blueprint-chip">{props.label}</span>
  );
}
