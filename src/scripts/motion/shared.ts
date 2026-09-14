import { prefersReducedMotion } from "motion"

export const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

export const isReduced = (): boolean => prefersReducedMotion.current === true

export const decimalsOf = (text: string): number => {
    const separator = Math.max(text.lastIndexOf("."), text.lastIndexOf(","))
    return separator === -1 ? 0 : text.length - separator - 1
}

export const formatFrom = (source: string): ((value: number) => string) => {
    const enUS = /\d{1,3}(,\d{3})+/.test(source)
    const deDE = /\d{1,3}(\.\d{3})+/.test(source)
    if (enUS || deDE) {
        const locale = enUS ? "en-US" : "de-DE"
        const decimals = enUS ? decimalsOf(source.replace(/,/g, "")) : decimalsOf(source.replace(/\./g, ""))
        const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: decimals })
        return (value) => formatter.format(value)
    }
    const decimals = decimalsOf(source)
    if (decimals > 0) return (value) => value.toFixed(decimals)
    return (value) => Math.round(value).toString()
}
