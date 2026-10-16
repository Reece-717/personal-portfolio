"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { buttonPrimary, buttonSecondary, buttonDanger, cardClass, inputClass } from "./styles";
import { ImageUpload } from "./ImageUpload";

export interface ProjectProps {
  id: string;
  title: string;
  summary: string;
  description: string;
  coverUrl: string | null;
  techStack: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  sortOrder: number;
}

interface ProjectItem {
  id?: string;
  title: string;
  summary: string;
  description: string;
  coverUrl: string;
  techStackText: string;
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
}

function toItem(p: ProjectProps): ProjectItem {
  return {
    id: p.id,
    title: p.title,
    summary: p.summary,
    description: p.description,
    coverUrl: p.coverUrl ?? "",
    techStackText: p.techStack.join(", "),
    githubUrl: p.githubUrl ?? "",
    demoUrl: p.demoUrl ?? "",
    featured: p.featured,
  };
}

export function ProjectsForm({ projects }: { projects: ProjectProps[] }) {
  const [items, setItems] = useState<ProjectItem[]>(projects.map(toItem));

  function add() {
    setItems((arr) => [
      ...arr,
      {
        title: "",
        summary: "",
        description: "",
        coverUrl: "",
        techStackText: "",
        githubUrl: "",
        demoUrl: "",
        featured: false,
      },
    ]);
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">项目</h2>
        <button type="button" onClick={add} className={buttonSecondary}>
          + 新建项目
        </button>
      </div>
      <div className="mt-4 space-y-6">
        {items.map((item, i) => (
          <ProjectCard
            key={item.id ?? `new-${i}`}
            item={item}
            index={i}
            onChange={(next) => setItems((arr) => arr.map((x, xi) => (xi === i ? next : x)))}
            onDelete={() => setItems((arr) => arr.filter((_, xi) => xi !== i))}
          />
        ))}
        {items.length === 0 && <p className="text-sm text-secondary">暂无项目，点击“新建项目”新增。</p>}
      </div>
    </div>
  );
}

function ProjectCard({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: ProjectItem;
  index: number;
  onChange: (next: ProjectItem) => void;
  onDelete: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof ProjectItem>(key: K, value: ProjectItem[K]) {
    onChange({ ...item, [key]: value });
  }

  function buildPayload() {
    return {
      title: item.title,
      summary: item.summary,
      description: item.description,
      coverUrl: item.coverUrl || null,
      techStack: item.techStackText
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: item.githubUrl || null,
      demoUrl: item.demoUrl || null,
      featured: item.featured,
      sortOrder: index,
    };
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      if (item.id) {
        await apiFetch(`/api/admin/projects/${item.id}`, {
          method: "PUT",
          body: JSON.stringify(buildPayload()),
        });
      } else {
        const created = await apiFetch<{ id: string }>("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(buildPayload()),
        });
        onChange({ ...item, id: created.id });
      }
      setMessage("已保存");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!item.id) {
      onDelete();
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/admin/projects/${item.id}`, { method: "DELETE" });
      onDelete();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "删除失败");
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          placeholder="项目名"
          value={item.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="技术栈（逗号分隔）"
          value={item.techStackText}
          onChange={(e) => update("techStackText", e.target.value)}
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <input
            placeholder="简介"
            value={item.summary}
            onChange={(e) => update("summary", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            placeholder="详细描述"
            rows={3}
            value={item.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
          />
        </div>
        <ImageUpload
          label="封面"
          value={item.coverUrl}
          onChange={(v) => update("coverUrl", v)}
          accept="image/*"
        />
        <input
          placeholder="GitHub URL"
          value={item.githubUrl}
          onChange={(e) => update("githubUrl", e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Demo URL"
          value={item.demoUrl}
          onChange={(e) => update("demoUrl", e.target.value)}
          className={inputClass}
        />
        <label className="flex items-center gap-2 text-sm text-secondary">
          <input
            type="checkbox"
            checked={item.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="h-4 w-4 accent-indigo-400"
          />
          设为精选
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className={buttonPrimary}>
          {saving ? "保存中…" : "保存"}
        </button>
        <button type="button" onClick={del} disabled={saving} className={buttonDanger}>
          删除
        </button>
        {message && <span className="text-sm text-secondary">{message}</span>}
      </div>
    </div>
  );
}

