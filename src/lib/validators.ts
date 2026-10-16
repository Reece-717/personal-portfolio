import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
});

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug 仅允许小写字母、数字与中划线")
    .max(200),
  summary: z.string().max(500).optional().nullable(),
  content: z.string().min(1),
  coverUrl: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().max(50)).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PostInput = z.infer<typeof postSchema>;

// ---- 后台内容管理 ----

export const profileSchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(100),
  title: z.string().min(1, "头衔不能为空").max(100),
  tagline: z.string().max(200),
  about: z.string(),
  avatarUrl: z.string().max(500).nullable().optional(),
  resumeUrl: z.string().max(500).nullable().optional(),
});

export const socialLinkSchema = z.object({
  type: z.string().min(1).max(50),
  label: z.string().min(1, "标签不能为空").max(50),
  url: z.string().min(1, "链接不能为空").max(500),
  sortOrder: z.coerce.number().int().nonnegative(),
});

export const socialLinksSchema = z.array(socialLinkSchema);

export const skillSchema = z.object({
  name: z.string().min(1, "技能名不能为空").max(50),
  level: z.coerce.number().int().min(0).max(100),
  icon: z.string().max(10).nullable().optional(),
  sortOrder: z.coerce.number().int().nonnegative(),
});

export const skillCategorySchema = z.object({
  name: z.string().min(1, "分类名不能为空").max(50),
  sortOrder: z.coerce.number().int().nonnegative(),
  skills: z.array(skillSchema),
});

export const skillsSchema = z.array(skillCategorySchema);

export const projectSchema = z.object({
  title: z.string().min(1, "项目名不能为空").max(200),
  summary: z.string().min(1, "简介不能为空").max(500),
  description: z.string(),
  coverUrl: z.string().max(500).nullable().optional(),
  techStack: z.array(z.string().max(50)).default([]),
  githubUrl: z.string().max(500).nullable().optional(),
  demoUrl: z.string().max(500).nullable().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;

