"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ORDER_STATUSES, type OrderRow } from "@/lib/supabase";
import { SERVICES, formatIDR } from "@/lib/data";

type Props = {
  loggedIn: boolean;
  dbConfigured: boolean;
  adminConfigured: boolean;
  notifyConfigured: boolean;
  title: string;
  subtitle: string;
};

const STATUS_STYLE: Record<string, string> = {
  BARU: "bg-gold-100 text-navy-900 border-gold-400",
  DIKONFIRMASI: "bg-navy-100 text-navy-900 border-navy-300",
  DITUGASKAN: "bg-lake-100 text-navy-900 border-lake-400",
  DIJEMPUT: "bg-brand-50 text-brand-700 border-brand-200",
  SELESAI: "bg-green-100 text-green-800 border-green-300",
  BATAL: "bg-red-100 text-red-700 border-red-300",
};

export default function AdminDashboard({
  loggedIn,
  dbConfigured,
  adminConfigured,
  notifyConfigured,
  title,
  subtitle,
}: Props) {
  const t = useTranslations("admin");

  const [authed, setAuthed] = useState(loggedIn);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { orders: OrderRow[] };
        setOrders(data.orders);
      } else if (res.status === 401) {
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed && dbConfigured) void loadOrders();
  }, [authed, dbConfigured, loadOrders]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setPassword("");
    } else {
      const data = (await res.json()) as { error?: string };
      setLoginError(data.error ?? t("login.wrong"));
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthed(false);
    setOrders([]);
  }

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = (await res.json()) as { order: OrderRow };
        setOrders((os) => os.map((o) => (o.id === id ? data.order : o)));
      }
    } finally {
      setSaving(null);
    }
  }

  /* ---------- Layar login ---------- */
  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="card p-8">
          <div className="text-center">
            <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-navy-900 text-2xl">
              🔐
            </span>
            <h1 className="mt-4 font-serif text-2xl font-bold text-navy-900">
              {t("login.heading")}
            </h1>
            <p className="mt-2 text-sm text-ink-soft">{t("login.desc")}</p>
          </div>
          {adminConfigured ? (
            <form onSubmit={login} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                  {t("login.password")}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm"
                  autoFocus
                />
              </label>
              {loginError && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                {t("login.button")}
              </button>
            </form>
          ) : (
            <p className="mt-6 rounded-xl bg-cream px-4 py-3 text-sm text-brand-700">
              ⚠️ {t("login.notConfigured")}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Dashboard ---------- */
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 py-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="rounded-lg border border-navy-200 px-4 py-2 text-xs font-bold text-navy-800 transition hover:border-gold-500"
          >
            ⟳ Refresh
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800"
          >
            {t("login.logout")}
          </button>
        </div>
      </div>

      {/* Peringatan setup */}
      {!dbConfigured && (
        <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          ⚠️ {t("setup.db")}
        </p>
      )}
      {dbConfigured && !notifyConfigured && (
        <p className="mb-4 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">
          ℹ️ {t("setup.wa")}
        </p>
      )}

      {/* Tabel pesanan */}
      {loading ? (
        <p className="py-16 text-center text-sm text-ink-soft">{t("table.loading")}</p>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-sm text-ink-soft">{t("table.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const service = SERVICES.find((s) => s.key === o.service_key);
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition hover:bg-cream/50"
                >
                  <span className="font-mono text-xs font-bold text-navy-900">
                    {o.resi}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[o.status] ?? ""}`}>
                    {t(`statusLabels.${o.status}`)}
                  </span>
                  <span className="text-sm font-semibold text-navy-900">{o.name}</span>
                  <span className="text-xs text-ink-soft">
                    {service?.key ? "" : ""}
                    {o.service_key}
                    {o.add_ons.length > 0 && ` +${o.add_ons.length}`}
                  </span>
                  <span className="ml-auto text-xs text-ink-soft">{o.date}</span>
                  <span className="text-sm font-bold text-brand-600">{formatIDR(o.total)}</span>
                  <span className="text-ink-soft">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-line bg-cream/40 px-5 py-4">
                    <div className="grid gap-x-8 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      <Detail label={t("table.customer")} value={`${o.name} · ${o.phone}`} />
                      <Detail label={t("table.date")} value={o.date} />
                      <Detail label={t("table.service")} value={o.service_key} />
                      <Detail label="Titik Jemput" value={o.meeting_point} />
                      <Detail label="Zona" value={o.zone ?? "—"} />
                      <Detail label="Koper / Peserta" value={`${o.suitcases} / ${o.participants}`} />
                      {o.notes && <Detail label="Catatan" value={o.notes} />}
                      {o.payment_method && (
                        <Detail label="Pembayaran" value={o.payment_method} />
                      )}
                      <Detail
                        label="Masuk"
                        value={new Date(o.created_at).toLocaleString("id-ID")}
                      />
                    </div>

                    {/* Aksi admin */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                          {t("table.status")}
                        </span>
                        <select
                          value={o.status}
                          disabled={saving === o.id}
                          onChange={(e) => void updateStatus(o.id, e.target.value)}
                          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {t(`statusLabels.${s}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <a
                        href={`https://wa.me/${o.phone}?text=${encodeURIComponent(
                          `Halo ${o.name}, kami dari UNANG LOJA. Pesanan Anda ${o.resi} — `,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700"
                      >
                        💬 {t("table.contact")}
                      </a>
                      <a
                        href={`/id/status?resi=${o.resi}`}
                        className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-bold text-navy-800 transition hover:border-gold-500"
                      >
                        🔎 Lacak Resi
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold text-ink-soft">{label}: </span>
      <span className="font-medium text-navy-900">{value}</span>
    </p>
  );
}
