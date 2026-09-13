export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
}
