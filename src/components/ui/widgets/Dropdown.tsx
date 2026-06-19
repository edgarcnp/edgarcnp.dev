import { type JSX } from "solid-js";

interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface DropdownProps {
    id: string;
    "aria-label": string;
    class?: string;
    value?: string;
    width?: string;
    placeholder?: string;
    disabled?: boolean;
    options?: DropdownOption[];
    onChange?: (value: string) => void;
    children?: JSX.Element;
}

export function Dropdown(props: DropdownProps) {
    const handleChange = (e: Event) => {
        const select = e.target as HTMLSelectElement;
        props.onChange?.(select.value);
    };

    return (
        <label
            classList={{
                dropdown: true,
                disabled: props.disabled,
                [props.class ?? ""]: !!props.class,
            }}
            style={{ width: props.width }}
        >
            <select
                id={props.id}
                value={props.value ?? ""}
                class={props.value ? undefined : "placeholder"}
                aria-label={props["aria-label"]}
                disabled={props.disabled}
                onChange={handleChange}
            >
                {props.placeholder && (
                    <option value="" disabled hidden>
                        {props.placeholder}
                    </option>
                )}
                {props.options?.map((option) => (
                    <option value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
                {props.children}
            </select>
            <span class="dropdown-icon" aria-hidden="true">
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
                    <path d="M6 9l6 6l6 -6" />
                </svg>
            </span>
        </label>
    );
}
