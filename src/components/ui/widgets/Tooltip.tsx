import { createSignal, createEffect, type JSX } from "solid-js";

interface TooltipProps {
    id?: string;
    anchor: JSX.Element;
    content: JSX.Element;
}

export function Tooltip(props: TooltipProps) {
    let anchorElement!: HTMLDivElement;
    let popover!: HTMLDivElement;

    const [tooltipX, setTooltipX] = createSignal(0);
    const [tooltipY, setTooltipY] = createSignal(0);
    const [visible, setVisible] = createSignal(false);

    const offsetY = 12;
    const offsetX = 16;

    const updatePosition = (e: PointerEvent) => {
        setTooltipX(e.clientX - offsetX);
        setTooltipY(e.clientY - offsetY);
    };

    const updatePositionFromAnchor = () => {
        const rect = anchorElement.getBoundingClientRect();
        setTooltipX(rect.left);
        setTooltipY(rect.top - offsetY);
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
                style={{ left: `${tooltipX()}px`, top: `${tooltipY()}px` }}
            >
                <div class="tooltip-content">{props.content}</div>
            </div>
        </>
    );
}
