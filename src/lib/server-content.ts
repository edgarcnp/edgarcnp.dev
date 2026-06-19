"use server";

import { getProjects as _getProjects, getProject as _getProject, getWriting as _getWriting, getWritingPost as _getWritingPost } from "~/lib/content";
import type { Project, WritingPost } from "~/lib/content";

export function getProjects(): Project[] {
  return _getProjects();
}

export function getProject(slug: string): Project | undefined {
  return _getProject(slug);
}

export function getWriting(): WritingPost[] {
  return _getWriting();
}

export function getWritingPost(slug: string): WritingPost | undefined {
  return _getWritingPost(slug);
}
