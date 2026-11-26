"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Icon, { type IconName } from "@/components/admin/Icon";

type NavItem = { href: string; label: string; icon: IconName; badge?: number };

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  pesanan: "Pesanan",
  pembayaran: "Pembayaran",
  bagasi: "Bagasi & Loker",
  pelacakan: "Pelacakan",
  pemandu: "Pemandu & Jadwal",
  pelanggan: "Pelanggan",
  ulasan: "Ulasan",
  layanan: "Layanan",
  pengaturan: "Pengaturan",
};

export default function AdminShell({
  user,
  pendingPayments,
  dataMode,
  children,
}: {
  user: { name: string; email: string };
  pendingPayments: number;
  dataMode: "supabase" | "local";
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const ops: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard Overview", icon: "dashboard" },
    { href: "/admin/pesanan", label: "Booking Management", icon: "receipt" },
    { href: "/admin/pembayaran", label: "Payment Verification", icon: "card", badge: pendingPayments },
    { href: "/admin/bagasi", label: "Luggage & Stalls", icon: "bag" },
    { href: "/admin/pelacakan", label: "Tracking Management", icon: "route" },
  ];
  const mgmt: NavItem[] = [
    { href: "/admin/pemandu", label: "Tour Guides & Schedule", icon: "calendar" },
    { href: "/admin/pelanggan", label: "Customers", icon: "users" },
    { href: "/admin/ulasan", label: "Customer Reviews", icon: "star" },
    { href: "/admin/layanan", label: "Services", icon: "layers" },
    { href: "/admin/pengaturan", label: "System Settings", icon: "settings" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const segment = pathname.split("/")[2] ?? "dashboard";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign(`/${locale}/admin`);
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <Image
          src="/logo.png"
          alt="Logo UNANG LOJA"
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-lg bg-white object-cover p-0.5 shadow-sm"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-serif text-sm font-bold text-white">UNANG LOJA</p>
          <p className="truncate text-[8px] font-semibold uppercase tracking-[0.16em] text-gold-300">
            Admin Portal · Samosir
          </p>
        </div>
      </div>

      <div className="mx-3 mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-gold-300">Super Admin</p>
        <p className="mt-0.5 truncate text-xs font-bold text-white">{user.name}</p>
        <p className="truncate text-[9px] text-white/40">{user.email}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">
          Menu Operasional
        </p>
        <div className="space-y-0.5">
          {ops.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={() => setOpen(false)} />
          ))}
        </div>
        <p className="px-2 pb-1.5 pt-4 text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">
          Manajemen
        </p>
        <div className="space-y-0.5">
          {mgmt.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={() => setOpen(false)} />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-white/60 hover:bg-white/5 hover:text-white"
        >
          <Icon name="external" className="h-3.5 w-3.5" />
          Buka situs pelanggan
        </Link>
        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-white/60 hover:bg-brand-600/20 hover:text-white"
        >
          <Icon name="logout" className="h-3.5 w-3.5" />
          Keluar dari portal
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy-950 lg:block">{nav}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy-950 shadow-2xl">{nav}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-3 py-2.5 md:px-5">
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-line p-2 text-navy-800 lg:hidden"
            >
              <Icon name="menu" className="h-4 w-4" />
            </button>

            <div className="hidden min-w-0 items-center gap-1.5 text-[10px] text-ink-soft sm:flex">
              <Link href="/admin/dashboard" className="font-semibold text-navy-800 hover:text-brand-600">
                Admin
              </Link>
              <span className="text-line">/</span>
              <span className="truncate font-bold text-navy-900">{LABELS[segment] ?? "Overview"}</span>
            </div>

            <form action={`/${locale}/admin/pesanan`} method="get" className="relative ml-auto w-full max-w-xs">
              <Icon
                name="search"
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft"
              />
              <input
                name="q"
                type="search"
                placeholder="Cari ID pesanan, nama, resi…"
                className="w-full rounded-lg border border-line bg-cream px-8 py-2 text-[11px] text-ink outline-none transition focus:border-navy-700 focus:bg-white"
              />
            </form>

            <div
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold md:flex ${
                dataMode === "supabase"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gold-300 bg-gold-50 text-gold-700"
              }`}
              title={
                dataMode === "supabase"
                  ? "Data tersimpan di Supabase"
                  : "Data tersimpan di file lokal (dev/uji)"
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  dataMode === "supabase" ? "bg-green-500" : "bg-gold-500"
                }`}
              />
              {dataMode === "supabase" ? "Supabase" : "Mode lokal"}
            </div>

            <Link
              href="/admin/pembayaran"
              className="relative grid h-8 w-8 place-items-center rounded-lg border border-line text-navy-800 hover:border-gold-500"
              aria-label="Verifikasi pembayaran"
            >
              <Icon name="bell" className="h-4 w-4" />
              {pendingPayments > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[8px] font-bold text-white">
                  {pendingPayments > 9 ? "9+" : pendingPayments}
                </span>
              )}
            </Link>

            <Link href="/admin/pengaturan" className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 hover:border-navy-300">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-navy-900 text-[9px] font-bold text-gold-300">
                {user.name.trim().charAt(0).toUpperCase() || "A"}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block max-w-[110px] truncate text-[10px] font-bold text-navy-900">
                  {user.name}
                </span>
                <span className="block text-[8px] uppercase tracking-wide text-ink-soft">Super Admin</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-3 py-4 md:px-5 md:py-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${
        active
          ? "bg-gold-500 text-navy-950 shadow-sm"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon name={item.icon} className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
            active ? "bg-navy-950 text-gold-300" : "bg-brand-600 text-white"
          }`}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
