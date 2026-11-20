import Image from "next/image";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import AdminLoginForm from "@/components/AdminLoginForm";
import { ensureAdminAccount, getSession } from "@/lib/auth";
import { storageMode } from "@/lib/store";

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
    <div className="relative flex min-h-screen flex-col bg-navy-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(197,155,39,.18), transparent 42%), radial-gradient(circle at 85% 80%, rgba(171,51,51,.22), transparent 45%)",
        }}
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo UNANG LOJA"
            width={44}
            height={44}
            className="h-11 w-11 rounded-lg border border-white/15 object-cover"
          />
          <div className="leading-tight">
            <p className="font-serif text-sm font-bold tracking-wide">UNANG LOJA</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold-300">
              Admin Portal · Samosir
            </p>
          </div>
        </div>
        <a
          href={`/${locale}`}
          className="rounded-lg border border-white/15 px-3 py-2 text-[11px] font-bold text-white/70 transition hover:border-gold-400 hover:text-white"
        >
          ← Kembali ke situs pelanggan
        </a>
      </header>

      <main className="relative mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-8 lg:grid-cols-[1fr_460px]">
        <section className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Akses Operasional Terbatas
          </span>
          <h1 className="mt-5 max-w-md font-serif text-4xl font-bold leading-[1.1]">
            Pusat Kendali Dermaga &amp; Reservasi Wisata
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            Kelola pesanan, verifikasi pembayaran, pantau loker bagasi, dan atur jadwal pemandu
            wisata Danau Toba dari satu dashboard.
          </p>

          <div className="mt-9 grid max-w-md grid-cols-3 gap-3 text-center">
            {[
              ["Pesanan", "Masuk real-time"],
              ["Pembayaran", "Verifikasi admin"],
              ["Bagasi", "Segel & loker"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
                <p className="text-[11px] font-bold text-gold-300">{title}</p>
                <p className="mt-1 text-[10px] leading-snug text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur sm:p-8 lg:mx-0">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500/15 text-gold-300">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l7 3v6c0 4.4-3 8.4-7 9-4-.6-7-4.6-7-9V6l7-3Z" />
                <path d="M9.5 12.2l1.8 1.8 3.4-3.6" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">
                Admin Portal
              </p>
              <h2 className="font-serif text-xl font-bold">Masuk Administrator</h2>
            </div>
          </div>

          {user && (
            <p className="mt-4 rounded-lg border border-gold-400/30 bg-gold-500/10 px-3 py-2 text-[11px] leading-relaxed text-gold-100">
              Anda masih masuk sebagai <strong>{user.name}</strong> (pelanggan). Login admin akan
              mengganti sesi ini.
            </p>
          )}

          {!seed.ready && (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] leading-relaxed text-red-100">
              Akun admin belum tersedia. Set <code>ADMIN_EMAIL</code> dan{" "}
              <code>ADMIN_PASSWORD</code> (min. 8 karakter) di environment server, lalu muat ulang
              halaman ini.
            </p>
          )}

          {isLocal && seed.ready && (
            <p className="mt-4 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-white/60">
              Mode pengembangan lokal: <strong className="text-white">admin@unangloja.id</strong> /{" "}
              <strong className="text-white">admin12345</strong>. Ganti lewat env{" "}
              <code>ADMIN_EMAIL</code> &amp; <code>ADMIN_PASSWORD</code>.
            </p>
          )}

          <AdminLoginForm />

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Sesi HttpOnly · kata sandi di-hash scrypt
          </p>
        </section>
      </main>

      <footer className="relative border-t border-white/10 py-4 text-center text-[10px] text-white/35">
        UNANG LOJA · Samosir, Danau Toba · Akses hanya untuk staf berwenang
      </footer>
    </div>
  );
}
