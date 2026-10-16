"use client";

import { useRef, useState } from "react";
import { buttonSecondary, inputClass } from "./styles";

export function ImageUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  preview = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  preview?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "上传失败");
      onChange((json as { data: { url: string } }).data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-secondary">{label}</label>
      <div className="flex items-center gap-3">
        {preview && value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-12 w-12 rounded-lg border border-line bg-base object-cover"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={buttonSecondary}
        >
          {uploading ? "上传中…" : "上传"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className={buttonSecondary}>
            移除
          </button>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="或直接填写图片 URL"
        className={`${inputClass} mt-2`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
