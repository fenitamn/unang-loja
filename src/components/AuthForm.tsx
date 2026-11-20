"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Mode = "login" | "register";

export default function AuthForm({ mode, next = null }: { mode: Mode; next?: string | null }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (isRegister) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
        setError(t("errRequired"));
        return;
      }
      if (form.password.length < 8) {
        setError(t("errPassword"));
        return;
      }
      if (form.password !== form.confirm) {
        setError(t("errConfirm"));
        return;
      }
    } else if (!form.email.trim() || !form.password) {
      setError(t("errRequired"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? {
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
              }
            : { email: form.email, password: form.password },
        ),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        role?: "admin" | "customer";
      };
      if (!response.ok) {
        setError(data.error ?? t("errGeneric"));
        setLoading(false);
        return;
      }

      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      const fallback = data.role === "admin" ? `/${locale}/admin/dashboard` : `/${locale}/akun`;
      window.location.assign(safeNext ?? fallback);
    } catch {
      setError(t("errGeneric"));
      setLoading(false);
    }
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-toba lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-8 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(197,155,39,.35), transparent 40%), radial-gradient(circle at 80% 90%, rgba(171,51,51,.35), transparent 45%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {t("badge")}
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold leading-tight">
            {isRegister ? t("registerTitle") : t("loginTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {isRegister ? t("registerSubtitle") : t("loginSubtitle")}
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[t("benefit1"), t("benefit2"), t("benefit3")].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-white/85">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-500/20 text-[11px] font-bold text-gold-300">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-10 rounded-xl border border-white/15 bg-white/5 p-4 text-[11px] leading-relaxed text-white/60">
          <p className="font-bold uppercase tracking-[0.14em] text-gold-300">UNANG LOJA</p>
          <p className="mt-1">Samosir · Danau Toba — {t("secure")}</p>
        </div>
      </aside>

      <div className="p-6 sm:p-9">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-800">
          <span aria-hidden="true">←</span> {t("backHome")}
        </Link>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
            {isRegister ? t("toRegister") : t("toLogin")}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
            {isRegister ? t("registerTitle") : t("loginTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {isRegister ? t("registerSubtitle") : t("loginSubtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy-900">{t("name")}</span>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-100"
                placeholder="Nama Lengkap"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-navy-900">{t("email")}</span>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-100"
              placeholder="nama@email.com"
            />
          </label>

          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy-900">{t("phone")}</span>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                autoComplete="tel"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-100"
                placeholder="0812xxxxxxx"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-navy-900">{t("password")}</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 pr-14 text-sm text-ink outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-100"
                placeholder={t("passwordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-[10px] font-bold uppercase tracking-wide text-ink-soft hover:text-navy-800"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy-900">{t("confirm")}</span>
              <input
                type={show ? "text" : "password"}
                value={form.confirm}
                onChange={set("confirm")}
                autoComplete="new-password"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-100"
                placeholder={t("confirm")}
              />
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("loading") : isRegister ? t("submitRegister") : t("submitLogin")}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-soft">
          {isRegister ? t("haveAccount") : t("noAccount")}{" "}
          <Link
            href={isRegister ? "/masuk" : "/daftar"}
            className="font-bold text-navy-800 underline decoration-gold-400 underline-offset-2 hover:text-brand-600"
          >
            {isRegister ? t("toLogin") : t("toRegister")}
          </Link>
        </p>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-line pt-5 text-[11px] text-ink-soft sm:flex-row sm:justify-between">
          <span>{t("adminHint")}</span>
          <Link href="/admin" className="inline-flex items-center gap-1 font-bold text-navy-800 hover:text-brand-600">
            {t("adminLink")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
