import { createSignal, createEffect, type JSX } from "solid-js";

interface TooltipProps {
    id?: string;
    anchor: JSX.Element;
    content: JSX.Element;
}

export function Tooltip(props: TooltipProps) {
    let anchorElement!: HTMLDivElement;
    let popover!: HTMLDivElement;

    const [visible, setVisible] = createSignal(false);

    const offsetY = 12;
    const offsetX = 16;

    const updatePosition = (e: PointerEvent) => {
        if (!popover) return;
        popover.style.setProperty("--tooltip-x", `${e.clientX - offsetX}px`);
        popover.style.setProperty("--tooltip-y", `${e.clientY - offsetY}px`);
    };

    const updatePositionFromAnchor = () => {
        if (!popover || !anchorElement) return;
        const rect = anchorElement.getBoundingClientRect();
        popover.style.setProperty("--tooltip-x", `${rect.left}px`);
        popover.style.setProperty("--tooltip-y", `${rect.top - offsetY}px`);
    };

    createEffect(() => {
        if (!popover) return;
        if (visible()) {
            popover.showPopover();
        } else {
            popover.hidePopover();
        }
    });

    return (
        <>
            <div
                ref={anchorElement}
                class="tooltip-anchor"
                onPointerMove={updatePosition}
                onPointerEnter={() => setVisible(true)}
                onPointerLeave={() => setVisible(false)}
                onFocusIn={() => {
                    updatePositionFromAnchor();
                    setVisible(true);
                }}
                onFocusOut={() => setVisible(false)}
                role="group"
                aria-describedby={props.id}
            >
                {props.anchor}
            </div>
            <div
                ref={popover}
                popover="manual"
                class="tooltip-container"
                role="tooltip"
                id={props.id}
            >
                <div class="tooltip-content">{props.content}</div>
            </div>
        </>
    );
}
