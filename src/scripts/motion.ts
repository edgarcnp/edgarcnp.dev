import { animate, inView } from "motion"

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

if (!reduced) {
    const reveal = document.querySelectorAll<HTMLElement>("[data-reveal]")
    reveal.forEach((el) => {
        inView(
            el,
            () => {
                animate(
                    el,
                    { opacity: [0, 1], y: [16, 0] } as Parameters<typeof animate>[1],
                    { duration: 0.45, ease: "easeOut" },
                )
            },
            { margin: "-40px" },
        )
    })
}
