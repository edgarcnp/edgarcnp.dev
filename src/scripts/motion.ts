import { animate, inView } from "motion"

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const revealed = new WeakSet<HTMLElement>()
const stops: (() => void)[] = []

const setup = () => {
    stops.splice(0).forEach((stop) => stop())
    if (reduced) return

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (revealed.has(el)) return
        stops.push(
            inView(
                el,
                () => {
                    revealed.add(el)
                    animate(
                        el,
                        { opacity: [0, 1], y: [16, 0] } as Parameters<typeof animate>[1],
                        { duration: 0.45, ease: "easeOut" },
                    )
                },
                { margin: "-40px" },
            ),
        )
    })
}

document.addEventListener("astro:page-load", setup)
setup()
