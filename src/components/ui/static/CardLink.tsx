import { IconExternalLink } from "../icons/index";

type CardLinkProps = {
    title: string;
    desc: string;
    href: string;
    class?: string;
};

export function CardLink(props: CardLinkProps) {
    return (
        <a
            class={`button card card-link ${props.class ?? ""}`}
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div class="link-text">
                <h4>{props.title}</h4>
                <p>{props.desc}</p>
            </div>
            <IconExternalLink />
        </a>
    );
}
