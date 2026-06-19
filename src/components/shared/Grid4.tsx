interface Item {
  label: string;
  title: string;
  description: string;
}

interface Props {
  items: Item[];
}

export default function Grid4(props: Props) {
  return (
    <section class="section-motion motion-delay-2 grid gap-4 lg:grid-cols-4">
      {props.items.map(({ label, title, description }) => (
        <article class="blueprint-module p-5">
          <p class="blueprint-label">{label}</p>
          <h3 class="mt-4 text-lg font-semibold text-(--blueprint-text)">{title}</h3>
          <p class="mt-3 text-sm leading-6 text-(--blueprint-muted)">{description}</p>
        </article>
      ))}
    </section>
  );
}
