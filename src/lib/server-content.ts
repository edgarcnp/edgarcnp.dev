"use server";

import { validate, ProfileSchema, ContactSchema, CapabilitiesSchema } from "~/data/schemas";
import profileRaw from "~/data/profile.json";
import contactRaw from "~/data/contact.json";
import capabilitiesRaw from "~/data/capabilities.json";
import type { Profile, ContactLink, Capability } from "~/data/schemas";
import { getProjects as _getProjects, getProject as _getProject, getWriting as _getWriting, getWritingPost as _getWritingPost } from "~/lib/content";

export async function getProjects() { return _getProjects(); }
export async function getProject(slug: string) { return _getProject(slug); }
export async function getWriting() { return _getWriting(); }
export async function getWritingPost(slug: string) { return _getWritingPost(slug); }

export async function getProfile(): Promise<Profile> {
  return validate(ProfileSchema, profileRaw, "profile.json");
}

export async function getContact(): Promise<{ links: ContactLink[] }> {
  return validate(ContactSchema, contactRaw, "contact.json");
}

export async function getCapabilities(): Promise<{ capabilities: Capability[] }> {
  return validate(CapabilitiesSchema, capabilitiesRaw, "capabilities.json");
}
