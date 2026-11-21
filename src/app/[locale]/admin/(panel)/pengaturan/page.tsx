import { setRequestLocale } from "next-intl/server";
import { PageHeader, Panel } from "@/components/admin/AdminUI";
import ProfileForm from "@/components/admin/ProfileForm";
import { requireAdminPage } from "@/lib/auth";
import { isNotifyConfigured } from "@/lib/notify";
import { isDbConfigured } from "@/lib/supabase";
import { storageMode } from "@/lib/store";

function StatusRow({
  label,
  value,
  ok,
  hint,
}: {
  label: string;
  value: string;
  ok: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 last:border-0">
      <div>
        <p className="text-[11px] font-semibold text-navy-900">{label}</p>
        {hint && <p className="text-[9px] text-ink-soft">{hint}</p>}
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
          ok
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-gold-300 bg-gold-50 text-gold-700"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-green-500" : "bg-gold-500"}`} />
        {value}
      </span>
    </div>
  );
}

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireAdminPage(locale);

  const mode = storageMode();
  const supabase = isDbConfigured();
  const notify = isNotifyConfigured();
  const authSecret = Boolean(process.env.AUTH_SECRET);
  const adminSeed = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / System Settings"
        title="Pengaturan Sistem"
        subtitle="Profil administrator dan status integrasi server. Tidak ada tombol dekoratif di halaman ini."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Profil administrator" description={`Masuk sebagai ${user.email}`}>
          <ProfileForm
            variant="admin"
            user={{ name: user.name, email: user.email, phone: user.phone }}
          />
        </Panel>

        <Panel title="Status integrasi" description="Konfigurasi dibaca langsung dari environment server.">
          <div>
            <StatusRow
              label="Penyimpanan data"
              value={mode === "supabase" ? "Supabase" : "File lokal"}
              ok={mode === "supabase"}
              hint={
                mode === "supabase"
                  ? "Data tersimpan permanen di database."
                  : "Hanya untuk pengembangan/uji. Set SUPABASE_URL + SERVICE_ROLE_KEY untuk produksi."
              }
            />
            <StatusRow
              label="Supabase"
              value={supabase ? "Terhubung" : "Belum diset"}
              ok={supabase}
              hint="SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY"
            />
            <StatusRow
              label="Secret sesi"
              value={authSecret ? "AUTH_SECRET diset" : "Otomatis (lokal)"}
              ok={authSecret || process.env.NODE_ENV !== "production"}
              hint="Wajib di produksi: string acak min. 16 karakter."
            />
            <StatusRow
              label="Seed admin"
              value={adminSeed ? "Env tersedia" : "Default / manual"}
              ok={adminSeed}
              hint="ADMIN_EMAIL + ADMIN_PASSWORD (min. 8 karakter)."
            />
            <StatusRow
              label="Notifikasi WhatsApp"
              value={notify ? "Aktif" : "Tidak aktif"}
              ok={notify}
              hint="FONTE_TOKEN + ADMIN_WA (Fonnte)."
            />
          </div>
        </Panel>
      </div>

      <Panel title="Checklist produksi" description="Langkah mengaktifkan data permanen di Vercel.">
        <ol className="space-y-2 p-4 text-[11px] leading-relaxed text-ink">
          <li>
            <strong>1.</strong> Buat proyek Supabase, lalu jalankan{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">supabase/schema.sql</code>{" "}
            dan{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">supabase/schema-v2.sql</code>{" "}
            di SQL Editor.
          </li>
          <li>
            <strong>2.</strong> Set environment Vercel:{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">SUPABASE_URL</code>,{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code>,{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">AUTH_SECRET</code>.
          </li>
          <li>
            <strong>3.</strong> Set{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">ADMIN_EMAIL</code> +{" "}
            <code className="rounded bg-cream-deep px-1 py-0.5 font-mono text-[10px]">ADMIN_PASSWORD</code>{" "}
            untuk membuat admin pertama saat login.
          </li>
          <li>
            <strong>4.</strong> Deploy ulang, login ke Admin Portal, lalu ganti kata sandi melalui form
            profil di atas.
          </li>
        </ol>
        <p className="border-t border-line px-4 py-2.5 text-[10px] text-ink-soft">
          Tanpa Supabase di produksi, halaman publik tetap tampil tetapi login, pesanan, dan data
          operasional akan menampilkan pesan konfigurasi (tidak memakai data palsu).
        </p>
      </Panel>

      <Panel title="Keamanan & akses" description="Ringkasan kontrol yang diterapkan.">
        <ul className="grid gap-2 p-4 text-[11px] leading-relaxed text-ink-soft sm:grid-cols-2">
          <li>• Kata sandi di-hash scrypt dengan salt acak per akun.</li>
          <li>• Sesi HttpOnly + SameSite=Lax, ditandatangani HMAC-SHA256.</li>
          <li>• Setiap halaman & API admin memeriksa role dari sesi server.</li>
          <li>• Pelanggan hanya dapat melihat pesanan miliknya sendiri.</li>
          <li>• Endpoint lacak publik tidak mengembalikan telepon, email, atau bukti bayar.</li>
          <li>• Rate limit dasar pada login/registrasi.</li>
        </ul>
      </Panel>
    </div>
  );
}
