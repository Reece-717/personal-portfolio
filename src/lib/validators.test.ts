import { describe, it, expect } from "vitest";
import {
  loginSchema,
  postSchema,
  profileSchema,
  skillSchema,
  projectSchema,
} from "./validators";

describe("loginSchema", () => {
  it("接受合法账号密码", () => {
    const r = loginSchema.safeParse({ username: "admin", password: "123456" });
    expect(r.success).toBe(true);
  });

  it("拒绝过短密码", () => {
    const r = loginSchema.safeParse({ username: "admin", password: "123" });
    expect(r.success).toBe(false);
  });
});

describe("postSchema", () => {
  it("接受合法 slug", () => {
    const r = postSchema.safeParse({
      title: "标题",
      slug: "hello-world",
      content: "正文",
      tags: [],
      status: "DRAFT",
    });
    expect(r.success).toBe(true);
  });

  it("拒绝含大写或空格的 slug", () => {
    const r = postSchema.safeParse({
      title: "标题",
      slug: "Hello World",
      content: "正文",
      tags: [],
      status: "DRAFT",
    });
    expect(r.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("接受合法资料", () => {
    const r = profileSchema.safeParse({
      name: "张三",
      title: "工程师",
      tagline: "简介",
      about: "关于",
    });
    expect(r.success).toBe(true);
  });

  it("姓名为空时拒绝", () => {
    const r = profileSchema.safeParse({ name: "", title: "工程师", tagline: "", about: "" });
    expect(r.success).toBe(false);
  });
});

describe("skillSchema", () => {
  it("拒绝超出 0-100 的熟练度", () => {
    const r = skillSchema.safeParse({ name: "React", level: 150, sortOrder: 0 });
    expect(r.success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("techStack 默认空数组", () => {
    const r = projectSchema.parse({ title: "t", summary: "s", description: "" });
    expect(r.techStack).toEqual([]);
  });
});
