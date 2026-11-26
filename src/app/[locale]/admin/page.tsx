import Image from "next/image";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import AdminLoginForm from "@/components/AdminLoginForm";
import { ensureAdminAccount, getSession } from "@/lib/auth";
import { storageMode } from "@/lib/store";

// Halaman login admin membaca sesi yang sudah ada dari cookie.
export const dynamic = "force-dynamic";

export default async function AdminPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSession();
  if (user?.role === "admin") redirect(`/${locale}/admin/dashboard`);

  const seed = await ensureAdminAccount();
  const isLocal = storageMode() === "local" && process.env.NODE_ENV !== "production";

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f4f1e9] text-navy-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 10%, rgba(197,155,39,.12), transparent 34%), radial-gradient(circle at 88% 82%, rgba(27,54,93,.08), transparent 38%)",
        }}
      />

      <header className="relative border-b border-line bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo UNANG LOJA"
              width={38}
              height={38}
              className="h-9 w-9 rounded-lg border border-line object-cover"
            />
            <div className="leading-tight">
              <p className="font-serif text-[13px] font-bold tracking-[0.06em] text-navy-900">
                UNANG LOJA
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-gold-600">
                Samosir · Danau Toba
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-ink-soft sm:block">
              Akses terbatas · Portal operasional
            </span>
            <a
              href={`/${locale}`}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-[10px] font-bold text-navy-700 transition hover:border-gold-500 hover:text-gold-700"
            >
              ← Situs pelanggan
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-gold-200 bg-gold-50">
              <Image
                src="/logo.png"
                alt="Logo UNANG LOJA"
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover"
              />
            </div>
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-600">
              Portal Operasional Internal &amp; Dermaga
            </p>
            <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-navy-900">
              Masuk Administrator
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-[12px] leading-relaxed text-ink-soft">
              Kelola pesanan, verifikasi pembayaran, dan pantau bagasi dari pos operasional
              UNANG LOJA.
            </p>
          </div>

          {user && (
            <p className="mt-4 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-[11px] leading-relaxed text-gold-800">
              Anda masih masuk sebagai <strong>{user.name}</strong> (pelanggan). Login admin akan
              mengganti sesi ini.
            </p>
          )}

          {!seed.ready && (
            <p className="mt-4 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-[11px] leading-relaxed text-brand-700">
              Akun admin belum tersedia. Set <code>ADMIN_EMAIL</code> dan{" "}
              <code>ADMIN_PASSWORD</code> (min. 8 karakter) di environment server, lalu muat ulang
              halaman ini.
            </p>
          )}

          {isLocal && seed.ready && (
            <p className="mt-4 rounded-lg border border-line bg-cream px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
              Mode pengembangan lokal:{" "}
              <strong className="text-navy-900">admin@unangloja.id</strong> /{" "}
              <strong className="text-navy-900">admin12345</strong>. Ganti lewat env{" "}
              <code>ADMIN_EMAIL</code> &amp; <code>ADMIN_PASSWORD</code>.
            </p>
          )}

          <AdminLoginForm />

          <div className="mt-5 border-t border-line pt-4 text-center">
            <p className="text-[10px] leading-relaxed text-ink-soft">
              Sesi HttpOnly · kata sandi di-hash scrypt · akses diaudit
            </p>
            <p className="mt-1 text-[10px] text-ink-soft">
              Supervisor 24/7:{" "}
              <a
                href="https://wa.me/6285143180788"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-600 hover:underline"
              >
                +62 851-4318-0788
              </a>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] text-ink-soft">
          Posko UNANG LOJA Samosir · Tomok · Ambarita · Tuk Tuk
        </p>
      </main>

      <footer className="relative border-t border-line bg-white/60 py-4 text-center text-[10px] text-ink-soft">
        UNANG LOJA · Samosir, Danau Toba · Akses hanya untuk staf berwenang
      </footer>
    </div>
  );
}
