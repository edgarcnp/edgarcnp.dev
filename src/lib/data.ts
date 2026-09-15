import { getEntry } from "astro:content"

export async function getProfile() {
    const entry = await getEntry("profile", "profile")
    if (!entry) throw new Error("Missing profile data entry")
    return entry.data
}

export async function getContact() {
    const entry = await getEntry("contact", "contact")
    if (!entry) throw new Error("Missing contact data entry")
    return entry.data
}

export async function getCapabilities() {
    const entry = await getEntry("capabilities", "capabilities")
    if (!entry) throw new Error("Missing capabilities data entry")
    return entry.data
}

export async function getContributions() {
    const entry = await getEntry("contributions", "contributions")
    if (!entry) throw new Error("Missing contributions data entry")
    return entry.data
}
