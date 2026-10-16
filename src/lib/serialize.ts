import type { Post, Project } from "@prisma/client";

/** 安全解析 JSON 字符串数组（如 techStack、tags） */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export type ProjectDto = Omit<Project, "techStack"> & { techStack: string[] };
export type PostDto = Omit<Post, "tags"> & { tags: string[] };

export function toProjectDto(project: Project): ProjectDto {
  const { techStack, ...rest } = project;
  return { ...rest, techStack: parseJsonArray(techStack) };
}

export function toPostDto(post: Post): PostDto {
  const { tags, ...rest } = post;
  return { ...rest, tags: parseJsonArray(tags) };
}
