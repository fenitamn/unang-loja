# UNANG LOJA — Website Pemesanan & Operasional

Website layanan pemandu wisata dan penitipan/antar bagasi di Pulau Samosir, Danau Toba.
Mencakup situs publik dua bahasa, akun pelanggan, alur pemesanan + pembayaran manual,
pelacakan resi, dan portal admin untuk memproses pesanan.

- Produksi: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, next-intl.
- Data: Supabase (produksi) atau file JSON lokal (pengembangan/uji).
- Autentikasi: email + kata sandi, hash `scrypt`, cookie sesi HttpOnly bertanda tangan HMAC.
  Seluruh halaman pelanggan wajib login; hanya masuk/daftar/lupa sandi dan login admin yang publik.
- Pembayaran: transfer bank / dompet digital manual, unggah bukti, verifikasi oleh admin.
- Tanpa payment gateway dan tanpa data transaksi palsu. Bila database/server belum
  dikonfigurasi, aplikasi menampilkan pesan konfigurasi, bukan transaksi simulasi.

## Menjalankan secara lokal

Prasyarat: Node.js 20+ dan npm.

```bash
npm install
copy .env.example .env.local   # Windows
# cp .env.example .env.local   # macOS/Linux
npm run dev
```

Buka `http://localhost:3000` (diarahkan ke `/id`). Untuk menguji cepat tanpa Supabase:

1. Biarkan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` kosong.
2. Jalankan `npm run dev` (mode file lokal otomatis aktif di development).
3. Masuk ke Admin Portal dengan akun seed development:
   - URL: `/id/admin`
   - Email: `admin@unangloja.id`
   - Kata sandi: `admin12345`
4. Daftar akun pelanggan lewat `/id/daftar`, lalu pesan lewat `/id/pesan`.
5. Untuk melihat data contoh yang sudah terisi, gunakan `.data/store.json` yang ada
   (hanya data uji lokal, tidak ikut di-commit).

> Mode file lokal bersifat sementara. Data hilang saat proses server berhenti dan tidak
> cocok untuk produksi multi-instance.

## Environment variables

Salin `.env.example` menjadi `.env.local`. Variabel utama:

| Variabel | Wajib | Keterangan |
|---|---|---|
| `SUPABASE_URL` | Produksi | URL proyek Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Produksi | Service role key (server-only, jangan diekspos ke client). |
| `AUTH_SECRET` | Produksi | String acak minimal 16 karakter untuk menandatangani sesi. |
| `ADMIN_EMAIL` | Produksi | Email admin pertama. |
| `ADMIN_PASSWORD` | Produksi | Kata sandi admin pertama, minimal 8 karakter. |
| `ADMIN_NAME` | Opsional | Nama tampilan admin. |
| `ALLOW_LOCAL_DB` | Opsional | `1` hanya untuk demo terbatas; jangan untuk data nyata. |
| `NEXT_PUBLIC_BCA_ACCOUNT` | Opsional | Nomor rekening BCA tujuan. |
| `NEXT_PUBLIC_BSI_ACCOUNT` | Opsional | Nomor rekening BSI tujuan. |
| `NEXT_PUBLIC_GOPAY_ACCOUNT` | Opsional | Nomor GoPay tujuan. |
| `NEXT_PUBLIC_OVO_ACCOUNT` | Opsional | Nomor OVO tujuan. |
| `NEXT_PUBLIC_DANA_ACCOUNT` | Opsional | Nomor DANA tujuan. |
| `FONTE_TOKEN` | Opsional | Token Fonnte untuk notifikasi WhatsApp admin. |
| `ADMIN_WA` | Opsional | Nomor WhatsApp admin format `62xxx`. |

Jika nomor pembayaran publik dikosongkan, halaman pembayaran menampilkan
“Konfirmasi nomor via WhatsApp admin” — tidak pernah menampilkan nomor rekening contoh
sebagai tujuan transfer.

Buat `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Supabase

1. Buat proyek Supabase.
2. Jalankan `supabase/schema.sql` lalu `supabase/schema-v2.sql` di SQL Editor.
3. Isi `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di environment.
4. Login pertama ke Admin Portal; akun admin dibuat dari `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
5. Seed layanan/pemandu/loker sudah disertakan di skrip SQL. Periksa dan sesuaikan tarif
   di menu Admin → Layanan sebelum menerima pesanan nyata.

Skema menyimpan pengguna, sesi, pesanan, layanan, pemandu, loker, ulasan, dan
pengaturan operasional. Akses tulis hanya lewat server function/route handler dengan
pemeriksaan role.

## Peran & alur utama

### Pelanggan

- Daftar/masuk di `/id/daftar` dan `/id/masuk` (tersedia juga versi `/en`).
- Pesan 4 langkah di `/id/pesan`: layanan → tanggal/lokasi → kontak → pembayaran.
- Pesanan yang dibuat saat login otomatis terhubung ke akun.
- Unggah bukti bayar (JPG/PNG/WEBP, maks. 2 MB) saat memesan atau dari detail pesanan.
- Pantau pesanan di `/id/akun` dan `/id/akun/pesanan/[resi]`.
- Lacak resi publik di `/id/status` (tanpa menampilkan telepon, email, atau bukti bayar).
- Kirim ulasan setelah pesanan berstatus `SELESAI`; ulasan tampil di beranda setelah
  dimoderasi admin.

### Admin

- Masuk di `/id/admin` (akun dengan role `admin`).
- Dashboard ringkasan, manajemen pesanan, pelanggan, pembayaran, pemandu, layanan,
  bagasi/loker, pelacakan, ulasan, dan pengaturan.
- Verifikasi pembayaran, ubah status, tugaskan pemandu, isi kode segel, dan catatan admin.
- Perubahan langsung terlihat di akun pelanggan dan halaman lacak.
- Ekspor pesanan ke CSV lewat `/api/admin/export`.

Status pesanan: `BARU`, `DIKONFIRMASI`, `DITUGASKAN`, `DIJEMPUT`, `SELESAI`, `BATAL`.
Status pembayaran: `UNPAID`, `PENDING`, `PAID`, `REJECTED`.

## Peta route

| Route | Akses | Keterangan |
|---|---|---|
| `/`, `/[locale]` | Wajib login | Beranda. |
| `/[locale]/layanan` | Wajib login | Layanan & tarif. |
| `/[locale]/pemandu` | Wajib login | Direktori pemandu. |
| `/[locale]/pesan` | Wajib login | Formulir pemesanan 4 langkah. |
| `/[locale]/status` | Wajib login | Pelacakan resi milik sendiri (admin: semua resi). |
| `/[locale]/bantuan` | Wajib login | FAQ, WhatsApp, form ulasan. |
| `/[locale]/masuk`, `/[locale]/daftar`, `/[locale]/lupa-sandi` | Publik | Autentikasi & bantuan akun. |
| `/[locale]/akun` | Pelanggan | Dashboard & profil pelanggan. |
| `/[locale]/akun/pesanan/[resi]` | Pelanggan | Detail pesanan, bukti bayar, ulasan. |
| `/[locale]/admin` | Publik | Login Admin Portal. |
| `/[locale]/admin/dashboard` | Admin | Ringkasan operasional. |
| `/[locale]/admin/pesanan` | Admin | Daftar & editor pesanan. |
| `/[locale]/admin/pelanggan` | Admin | Daftar pelanggan. |
| `/[locale]/admin/pembayaran` | Admin | Verifikasi pembayaran. |
| `/[locale]/admin/pemandu` | Admin | Kelola pemandu & tarif. |
| `/[locale]/admin/layanan` | Admin | Kelola layanan & ketersediaan. |
| `/[locale]/admin/bagasi` | Admin | Loker & kapasitas. |
| `/[locale]/admin/pelacakan` | Admin | Status pengantaran. |
| `/[locale]/admin/ulasan` | Admin | Moderasi ulasan. |
| `/[locale]/admin/pengaturan` | Admin | Profil & status integrasi. |

API internal: `/api/auth/*`, `/api/orders`, `/api/orders/[id]`, `/api/account`,
`/api/account/orders/[id]/proof`, `/api/track`, `/api/reviews`, dan `/api/admin/*`.
Semua endpoint mutasi memeriksa origin, sesi, dan role di server. Endpoint data
pelanggan hanya mengembalikan data milik sesi tersebut; endpoint admin menolak
pelanggan dengan `401`.

> **Catatan autentikasi:** repo ini memakai autentikasi aplikasi di atas tabel
> `app_users` Supabase (password `scrypt`, cookie HMAC HttpOnly). Supabase Auth/
> GoTrue belum dikonfigurasi di repo ini (tidak ada `@supabase/ssr` atau kunci
> anon), sehingga tidak diaktifkan agar akun lama tidak terkunci. Bila ingin
> migrasi ke Supabase Auth, siapkan kunci anon + migrasi pengguna lebih dahulu.

## Build & deploy

```bash
npm run build
npm start
```

Untuk Vercel:

1. Hubungkan repositori ke Vercel (framework Next.js terdeteksi otomatis).
2. Tambahkan environment produksi: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan nomor pembayaran publik.
3. Deploy, lalu login Admin Portal dan ganti kata sandi seed.
4. Pastikan `SUPABASE_URL` + service role key terisi. Tanpa itu, mode lokal tidak
   diaktifkan di produksi dan halaman data akan menampilkan pesan konfigurasi.

## Keamanan & batasan

- Kata sandi di-hash `scrypt` dengan salt acak; sesi HttpOnly + SameSite=Lax.
- Setiap halaman/API admin memeriksa role dari sesi server, bukan hanya UI.
- Pelanggan hanya dapat membaca pesanan miliknya sendiri.
- Endpoint lacak hanya untuk pengguna login: pelanggan hanya melihat resi miliknya,
  admin dapat melihat semua resi. Telepon, email, dan bukti bayar tidak dikembalikan.
- Rate limit dasar pada login dan registrasi.
- Pelacakan status bersifat manual (diperbarui admin), bukan GPS real-time.
- Ulasan hanya dapat dikirim untuk pesanan `SELESAI` milik sendiri dan menunggu moderasi.
- Nomor pembayaran harus diisi lewat environment sebelum menerima uang sungguhan.

## Pengujian yang dilakukan

- Build produksi `npm run build`: sukses (TypeScript lolos, 52 halaman/route diproses).
- E2E HTTP 50/50 pemeriksaan: halaman publik, login pelanggan/admin, pembatasan role,
  pembuatan pesanan, daftar/ubah pesanan admin, visibilitas status di akun pelanggan,
  halaman admin, aksi pemandu/layanan/loker, ulasan, profil, dan logout.
- Uji tambahan API: penugasan pemandu tercermin di `/api/track`, metode pembayaran,
  ekspor CSV, penolakan ekspor oleh pelanggan (401), resi kosong (400), PATCH lintas
  origin (403), dan publikasi ulasan admin.
- Uji browser: login pelanggan → `/id/akun`, login admin → `/id/admin/dashboard`,
  editor pesanan admin, verifikasi pembayaran `PENDING → PAID`, status pelanggan,
  unggah bukti bayar, dan tampilan resi asli.
- Uji alur pemesanan browser sampai selesai: pilih Penitipan, tanggal, 2 koper,
  data pelanggan terisi otomatis, pilih BSI, unggah bukti PNG, kirim → resi
  `UL-20261120-6451` dengan pembayaran `PENDING`; pesanan muncul di akun pelanggan
  dan portal admin.
- Uji form ulasan publik: error nyata untuk pesanan belum selesai dan sukses untuk
  pesanan `SELESAI` (tersimpan sebagai menunggu moderasi).
- Uji tampilan beranda: ulasan terverifikasi tampil lebih dulu, kartu contoh berlabel
  “Contoh”, dan catatan campuran ulasan.
- Uji halaman status: resi asli, kode segel, pemandu, status pembayaran, dan nomor
  rekening tujuan tidak lagi memakai data contoh.
- Uji responsif dasar dilakukan di browser; perangkat fisik belum diuji.

## Dokumen terkait

- `SPEC.md` — kebutuhan produk dan tarif.
- `PROGRESS.md` — status implementasi dan riwayat fase.
