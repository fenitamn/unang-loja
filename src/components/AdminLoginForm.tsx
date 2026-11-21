"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

export default function AdminLoginForm() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, adminOnly: true }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; redirect?: string };
      if (!response.ok) {
        setError(data.error ?? "Login gagal.");
        setLoading(false);
        return;
      }
      window.location.assign(`/${locale}${data.redirect ?? "/admin/dashboard"}`);
    } catch {
      setError("Tidak dapat menghubungi server.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          Email Administrator
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="admin@unangloja.id"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-gold-400 focus:bg-white/10"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          Kata Sandi
        </span>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-3 pr-16 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-gold-400 focus:bg-white/10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-[10px] font-bold uppercase tracking-wide text-white/50 hover:text-white"
          >
            {show ? "Sembunyi" : "Lihat"}
          </button>
        </div>
      </label>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l7 3v6c0 4.4-3 8.4-7 9-4-.6-7-4.6-7-9V6l7-3Z" />
          <path d="M9.5 12.2l1.8 1.8 3.4-3.6" />
        </svg>
        {loading ? "Memverifikasi…" : "Masuk sebagai Administrator"}
      </button>
    </form>
  );
}
