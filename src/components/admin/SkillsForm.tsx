"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { buttonPrimary, buttonSecondary, cardClass, inputClass } from "./styles";

export interface SkillProps {
  id: string;
  name: string;
  level: number;
  icon: string | null;
  sortOrder: number;
}

export interface SkillCategoryProps {
  id: string;
  name: string;
  sortOrder: number;
  skills: SkillProps[];
}

interface SkillItem {
  name: string;
  level: string;
  icon: string;
}

interface CategoryItem {
  name: string;
  skills: SkillItem[];
}

export function SkillsForm({ categories }: { categories: SkillCategoryProps[] }) {
  const [items, setItems] = useState<CategoryItem[]>(
    categories.map((c) => ({
      name: c.name,
      skills: c.skills.map((s) => ({
        name: s.name,
        level: String(s.level),
        icon: s.icon ?? "",
      })),
    })),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateCat(index: number, value: string) {
    setItems((arr) => arr.map((c, i) => (i === index ? { ...c, name: value } : c)));
  }
  function addCategory() {
    setItems((arr) => [...arr, { name: "", skills: [] }]);
  }
  function removeCategory(index: number) {
    setItems((arr) => arr.filter((_, i) => i !== index));
  }
  function addSkill(catIndex: number) {
    setItems((arr) =>
      arr.map((c, i) =>
        i === catIndex ? { ...c, skills: [...c.skills, { name: "", level: "80", icon: "" }] } : c,
      ),
    );
  }
  function updateSkill(catIndex: number, skillIndex: number, key: keyof SkillItem, value: string) {
    setItems((arr) =>
      arr.map((c, i) =>
        i === catIndex
          ? {
              ...c,
              skills: c.skills.map((s, si) => (si === skillIndex ? { ...s, [key]: value } : s)),
            }
          : c,
      ),
    );
  }
  function removeSkill(catIndex: number, skillIndex: number) {
    setItems((arr) =>
      arr.map((c, i) =>
        i === catIndex ? { ...c, skills: c.skills.filter((_, si) => si !== skillIndex) } : c,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = items.map((cat, ci) => ({
        name: cat.name,
        sortOrder: ci,
        skills: cat.skills.map((s, si) => ({
          name: s.name,
          level: Number(s.level) || 0,
          icon: s.icon || null,
          sortOrder: si,
        })),
      }));
      await apiFetch("/api/admin/skills", { method: "PUT", body: JSON.stringify(payload) });
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
        <h2 className="font-semibold">技能</h2>
        <button type="button" onClick={addCategory} className={buttonSecondary}>
          + 添加分类
        </button>
      </div>
      <div className="mt-4 space-y-6">
        {items.map((cat, ci) => (
          <div key={ci} className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2">
              <input
                placeholder="分类名（如 前端）"
                value={cat.name}
                onChange={(e) => updateCat(ci, e.target.value)}
                className={inputClass}
              />
              <button type="button" onClick={() => removeCategory(ci)} className={buttonSecondary}>
                删除分类
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {cat.skills.map((s, si) => (
                <div key={si} className="grid gap-2 sm:grid-cols-[auto_1fr_80px_auto]">
                  <input
                    placeholder="图标"
                    value={s.icon}
                    onChange={(e) => updateSkill(ci, si, "icon", e.target.value)}
                    className={`${inputClass} sm:w-16`}
                  />
                  <input
                    placeholder="技能名（如 React）"
                    value={s.name}
                    onChange={(e) => updateSkill(ci, si, "name", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={s.level}
                    onChange={(e) => updateSkill(ci, si, "level", e.target.value)}
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeSkill(ci, si)} className={buttonSecondary}>
                    删除
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addSkill(ci)} className={`${buttonSecondary} mt-3`}>
              + 添加技能
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-secondary">暂无技能分类。</p>}
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
