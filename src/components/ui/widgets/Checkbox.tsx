import { createSignal, createEffect, type JSX } from "solid-js";

interface CheckboxProps {
    id: string;
    class?: string;
    checked?: boolean;
    disabled?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    children?: JSX.Element;
    onChange?: (checked: boolean) => void;
}

export function Checkbox(props: CheckboxProps) {
    const [localChecked, setLocalChecked] = createSignal(props.checked ?? false);
    const [previousChecked, setPreviousChecked] = createSignal(localChecked());
    const [toggling, setToggling] = createSignal(false);

    createEffect(() => setLocalChecked(props.checked ?? false));

    createEffect(() => {
        const current = localChecked();
        const prev = previousChecked();
        if (current === prev) return;

        setPreviousChecked(current);
        setToggling(true);
        requestAnimationFrame(() => setToggling(false));
    });

    const handleChange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        setLocalChecked(input.checked);
        props.onChange?.(input.checked);
    };

    return (
        <label
            classList={{
                checkbox: true,
                disabled: props.disabled,
                toggling: toggling(),
                [props.class ?? ""]: !!props.class,
            }}
        >
            <input
                id={props.id}
                type="checkbox"
                checked={localChecked()}
                disabled={props.disabled}
                aria-label={props["aria-label"]}
                aria-labelledby={props["aria-labelledby"]}
                onChange={handleChange}
            />
            <span class="checkbox-control" aria-hidden="true">
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
                    <path d="M5 12l5 5l10 -10" />
                </svg>
            </span>
            {props.children && (
                <span class="checkbox-content">{props.children}</span>
            )}
        </label>
    );
}
