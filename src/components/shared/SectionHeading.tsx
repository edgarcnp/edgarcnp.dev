interface Props {
  label: string;
  title: string;
  description?: string;
}

export default function SectionHeading(props: Props) {
  return (
    <div class="space-y-3">
      <p class="blueprint-label">{props.label}</p>
      <h2 class="text-2xl font-semibold text-(--blueprint-text)">{props.title}</h2>
      {props.description && (
        <p class="text-sm leading-6 text-(--blueprint-muted)">{props.description}</p>
      )}
    </div>
  );
}
