"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

const STATIONS = ["Pos Tomok", "Pos Ambarita", "Pos Tuk Tuk", "Pos Balige"];

export default function AdminLoginForm() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [station, setStation] = useState(STATIONS[0]);
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("ul_admin_email");
    const savedStation = window.localStorage.getItem("ul_admin_station");
    if (savedEmail) setEmail(savedEmail);
    if (savedStation && STATIONS.includes(savedStation)) setStation(savedStation);
  }, []);

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
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Login gagal.");
        setLoading(false);
        return;
      }
      if (remember) {
        window.localStorage.setItem("ul_admin_email", email.trim());
      } else {
        window.localStorage.removeItem("ul_admin_email");
      }
      window.localStorage.setItem("ul_admin_station", station);
      window.location.assign(`/${locale}${data.redirect ?? "/admin/dashboard"}`);
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
          Email / ID Petugas
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="admin@unangloja.id"
          className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-navy-900 placeholder:text-ink-soft/60 outline-none transition focus:border-brand-500"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
          Kata Sandi
        </span>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-line bg-white px-3.5 py-3 pr-16 text-sm text-navy-900 placeholder:text-ink-soft/60 outline-none transition focus:border-brand-500"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-[10px] font-bold uppercase tracking-wide text-ink-soft hover:text-navy-900"
          >
            {show ? "Sembunyi" : "Lihat"}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
          Pos Operasional
        </span>
        <select
          value={station}
          onChange={(e) => setStation(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-navy-900 outline-none transition focus:border-brand-500"
        >
          {STATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-[10px] text-ink-soft">
          Pilihan pos disimpan di perangkat ini dan ditampilkan di panel admin.
        </span>
      </label>

      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 accent-[#ab3333]"
          />
          Ingat email di perangkat ini
        </label>
        <a
          href="https://wa.me/6281268008622?text=Halo%20supervisor%20UNANG%20LOJA%2C%20saya%20butuh%20bantuan%20akses%20portal%20admin."
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-brand-600 hover:underline"
        >
          Butuh bantuan?
        </a>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          "Memverifikasi…"
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Masuk ke Panel Operasional
          </>
        )}
      </button>
    </form>
  );
}
