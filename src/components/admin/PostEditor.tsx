"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Markdown } from "@/components/blog/Markdown";
import { buttonPrimary, buttonSecondary, cardClass, inputClass } from "./styles";
import { ImageUpload } from "./ImageUpload";

export interface PostEditorInitial {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverUrl: string | null;
  tags: string[];
  status: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostEditor({ initial }: { initial?: PostEditorInitial | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    summary: initial?.summary ?? "",
    content: initial?.content ?? "",
    coverUrl: initial?.coverUrl ?? "",
    tagsText: (initial?.tags ?? []).join(", "),
    status: initial?.status ?? "DRAFT",
  });
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function generateSlug() {
    setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      summary: form.summary || null,
      content: form.content,
      coverUrl: form.coverUrl || null,
      tags: form.tagsText
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status,
    };
    try {
      if (initial?.id) {
        await apiFetch(`/api/admin/posts/${initial.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/admin/posts", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
      setSaving(false);
    }
  }

  return (
    <div className={cardClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-secondary">标题</label>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-secondary">Slug（URL 标识）</label>
          <div className="flex gap-2">
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} />
            <button type="button" onClick={generateSlug} className={buttonSecondary}>
              生成
            </button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-secondary">摘要</label>
          <input value={form.summary} onChange={(e) => update("summary", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-secondary">标签（逗号分隔）</label>
          <input value={form.tagsText} onChange={(e) => update("tagsText", e.target.value)} className={inputClass} />
        </div>
        <ImageUpload
          label="封面"
          value={form.coverUrl}
          onChange={(v) => update("coverUrl", v)}
          accept="image/*"
        />
        <div>
          <label className="mb-1 block text-sm text-secondary">状态</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className={inputClass}
          >
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">发布</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-3">
          <label className="text-sm text-secondary">正文（Markdown）</label>
          <div className="flex gap-1 rounded-lg border border-line p-0.5">
            <button
              type="button"
              onClick={() => setTab("edit")}
              className={`rounded-md px-3 py-1 text-sm ${tab === "edit" ? "bg-accent text-white" : "text-secondary"}`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`rounded-md px-3 py-1 text-sm ${tab === "preview" ? "bg-accent text-white" : "text-secondary"}`}
            >
              预览
            </button>
          </div>
        </div>

        {tab === "edit" ? (
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={16}
            className={`${inputClass} font-mono text-sm`}
          />
        ) : (
          <div className="min-h-[16rem] rounded-lg border border-line bg-base p-4">
            {form.content ? <Markdown content={form.content} /> : <p className="text-sm text-secondary">暂无内容</p>}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className={buttonPrimary}>
          {saving ? "保存中…" : initial?.id ? "保存修改" : "创建文章"}
        </button>
        <button type="button" onClick={() => router.push("/admin/blog")} className={buttonSecondary}>
          取消
        </button>
        {message && <span className="text-sm text-red-400">{message}</span>}
      </div>
    </div>
  );
}
