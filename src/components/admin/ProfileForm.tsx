"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProfileForm({
  user,
  variant = "customer",
}: {
  user: { name: string; email: string; phone: string };
  variant?: "customer" | "admin";
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, currentPassword, newPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage({ kind: "error", text: data.error ?? "Gagal menyimpan." });
      } else {
        setMessage({
          kind: "ok",
          text: variant === "admin" ? "Profil admin tersimpan." : "Profil tersimpan.",
        });
        setCurrentPassword("");
        setNewPassword("");
        router.refresh();
      }
    } catch {
      setMessage({ kind: "error", text: "Tidak dapat menghubungi server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 p-4 md:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Nama</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-navy-700"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Email</span>
          <input
            value={user.email}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-line bg-cream-deep px-3 py-2 text-xs text-ink-soft"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">
            WhatsApp
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-navy-700"
          />
        </label>
      </div>

      <div className="rounded-lg border border-dashed border-line bg-cream/60 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
          Ganti kata sandi <span className="font-normal normal-case">(opsional)</span>
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium text-ink-soft">Kata sandi saat ini</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs outline-none focus:border-navy-700"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium text-ink-soft">Kata sandi baru</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs outline-none focus:border-navy-700"
            />
          </label>
        </div>
        <p className="mt-1 text-[9px] text-ink-soft">{t("errPassword")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-navy-900 px-4 py-2 text-[11px] font-bold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        {message && (
          <span
            className={`text-[10px] font-semibold ${
              message.kind === "ok" ? "text-green-700" : "text-red-600"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
