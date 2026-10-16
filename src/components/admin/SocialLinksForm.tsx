"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { buttonPrimary, buttonSecondary, cardClass, inputClass } from "./styles";

export interface SocialLinkProps {
  id: string;
  type: string;
  label: string;
  url: string;
  sortOrder: number;
}

interface LinkItem {
  type: string;
  label: string;
  url: string;
}

export function SocialLinksForm({ links }: { links: SocialLinkProps[] }) {
  const [items, setItems] = useState<LinkItem[]>(
    links.map((l) => ({ type: l.type, label: l.label, url: l.url })),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update(index: number, key: keyof LinkItem, value: string) {
    setItems((arr) => arr.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  }
  function remove(index: number) {
    setItems((arr) => arr.filter((_, i) => i !== index));
  }
  function add() {
    setItems((arr) => [...arr, { type: "", label: "", url: "" }]);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = items.map((it, i) => ({ ...it, sortOrder: i }));
      await apiFetch("/api/admin/social-links", { method: "PUT", body: JSON.stringify(payload) });
      setMessage("已保存");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">社交链接</h2>
        <button type="button" onClick={add} className={buttonSecondary}>
          + 添加
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
            <input
              placeholder="类型（github/email）"
              value={it.type}
              onChange={(e) => update(i, "type", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="显示名"
              value={it.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="https://…"
              value={it.url}
              onChange={(e) => update(i, "url", e.target.value)}
              className={inputClass}
            />
            <button type="button" onClick={() => remove(i)} className={buttonSecondary}>
              删除
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-secondary">暂无链接，点击“添加”新增。</p>}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className={buttonPrimary}>
          {saving ? "保存中…" : "保存"}
        </button>
        {message && <span className="text-sm text-secondary">{message}</span>}
      </div>
    </div>
  );
}
