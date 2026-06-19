import { For } from "solid-js";
import { validate, ContactSchema } from "~/data/schemas";
import contactRaw from "~/data/contact.json";
import SectionHeading from "~/components/shared/SectionHeading";

const contact = validate(ContactSchema, contactRaw, "contact.json");

export default function Contact() {
  return (
    <section class="max-w-3xl space-y-8">
      <SectionHeading
        label="Contact Endpoint"
        title="Static links, no message collection."
        description="Use email or a verified profile link. This portfolio does not collect, store, or relay visitor messages."
      />
      <div class="section-motion motion-delay-1 grid gap-4 sm:grid-cols-2">
        <For each={contact.links}>
          {(link) => (
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              class="blueprint-module blueprint-module-link group p-5 outline-none focus-visible:ring-2 focus-visible:ring-(--blueprint-accent)"
            >
              <span class="blueprint-label block">{link.kind}</span>
              <span class="mt-4 block text-lg font-semibold text-(--blueprint-text) group-hover:text-(--blueprint-accent)">{link.label}</span>
              <span class="mt-2 block text-sm leading-6 text-(--blueprint-muted)">{link.detail}</span>
            </a>
          )}
        </For>
      </div>
    </section>
  );
}
