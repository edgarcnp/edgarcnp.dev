export interface Command {
    id: string
    label: string
    href: string
    category: string
    keywords?: string[]
}

/** Subsequence match score; 0 when the needle is not a subsequence of the haystack. */
export function fuzzyScore(haystack: string, needle: string): number {
    let needleIndex = 0
    let firstIndex = -1
    let run = 0
    let bestRun = 0
    for (let i = 0; i < haystack.length && needleIndex < needle.length; i++) {
        if (haystack[i] === needle[needleIndex]) {
            if (firstIndex < 0) firstIndex = i
            run += 1
            if (run > bestRun) bestRun = run
            needleIndex += 1
        } else {
            run = 0
        }
    }
    if (needleIndex < needle.length) return 0
    return 1 + (bestRun * 2) - (firstIndex * 0.25)
}

/** AND-filter commands by whitespace-separated query tokens, best match first. */
export function filterCommands(commands: Command[], query: string): Command[] {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return []
    return commands
        .map((command) => {
            const haystack = `${command.label} ${command.category} ${(command.keywords ?? []).join(" ")}`.toLowerCase()
            let total = 0
            for (const token of tokens) {
                const score = fuzzyScore(haystack, token)
                if (score === 0) return null
                total += score
            }
            return { command, score: total }
        })
        .filter((entry): entry is { command: Command, score: number } => entry !== null)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.command)
}
