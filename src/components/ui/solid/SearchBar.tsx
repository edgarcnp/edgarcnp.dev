import { type JSX } from "solid-js";
import Input from "./Input";

interface SearchBarProps {
    id: string;
    "aria-label": string;
    class?: string;
    value?: string;
    placeholder?: string;
    small?: boolean;
    width?: string;
    onInput?: (value: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <div class="search-bar" style={{ width: props.width }} role="search">
            <Input
                id={props.id}
                small={props.small}
                width="100%"
                type="search"
                value={props.value}
                placeholder={props.placeholder}
                aria-label={props["aria-label"]}
                class={props.class}
                onInput={props.onInput}
                leading={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                        <path d="M21 21l-6 -6" />
                    </svg>
                }
            />
        </div>
    );
}
