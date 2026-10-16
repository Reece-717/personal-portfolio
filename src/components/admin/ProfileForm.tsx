"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { buttonPrimary, cardClass, inputClass } from "./styles";
import { ImageUpload } from "./ImageUpload";

export interface ProfileProps {
  name: string;
  title: string;
  tagline: string;
  about: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
}

export function ProfileForm({ profile }: { profile: ProfileProps | null }) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    title: profile?.title ?? "",
    tagline: profile?.tagline ?? "",
    about: profile?.about ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    resumeUrl: profile?.resumeUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          avatarUrl: form.avatarUrl || null,
          resumeUrl: form.resumeUrl || null,
        }),
      });
      setMessage({ type: "ok", text: "已保存" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "保存失败" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cardClass}>
      <h2 className="font-semibold">基本资料</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="姓名" value={form.name} onChange={(v) => update("name", v)} />
        <Field label="头衔" value={form.title} onChange={(v) => update("title", v)} />
        <div className="sm:col-span-2">
          <Field label="一句话简介（Tagline）" value={form.tagline} onChange={(v) => update("tagline", v)} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-secondary">关于我</label>
          <textarea
            value={form.about}
            onChange={(e) => update("about", e.target.value)}
            rows={6}
            className={inputClass}
          />
        </div>
        <ImageUpload
          label="头像"
          value={form.avatarUrl}
          onChange={(v) => update("avatarUrl", v)}
          accept="image/*"
        />
        <ImageUpload
          label="简历（PDF）"
          value={form.resumeUrl}
          onChange={(v) => update("resumeUrl", v)}
          accept="application/pdf"
          preview={false}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "保存中…" : "保存"}
        </button>
        {message && (
          <span className={message.type === "ok" ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-secondary">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}
