# PROGRESS — Website UNANG LOJA

Terakhir diperbarui: 20 November 2026.

## Status fase

| Fase | Status |
|---|---|
| 1. Halaman pelanggan (wajib login), dua bahasa, responsif, data awal | Selesai |
| 2. Database + pemesanan + pembayaran + resi + status | Selesai (Supabase + fallback file lokal untuk dev) |
| 3. Panel admin + aturan bisnis | Selesai |
| 4. Ulasan persisten, referral, SEO, README deploy | Selesai untuk inti; referral hanya dicatat (tanpa diskon) |

## Ringkasan implementasi

### Halaman pelanggan (wajib login)

- Beranda, layanan/tarif, direktori pemandu, formulir pemesanan 4 langkah, status resi,
  bantuan/FAQ, dan dua bahasa (ID/EN) dengan desain navy–maroon–gold–cream.
- Tarif mengikuti `SPEC.md`: pemanduan Rp300.000; penitipan Rp25.000/koper/hari;
  antar zona dekat Rp75.000; zona lintas Rp150.000; Fleksibel dan Mystery Rp350.000.
- Ulasan terverifikasi tampil lebih dulu di beranda. Kartu contoh diberi label “Contoh”
  dan catatan terpisah, tidak dicampur sebagai ulasan terverifikasi.
- Halaman status memakai data pesanan asli; tidak menampilkan telepon, email, atau bukti
  bayar. Kode segel, pemandu, dan status pembayaran berasal dari database.
- Nomor tujuan pembayaran dibaca dari environment publik. Bila belum diisi, pelanggan
  diarahkan ke admin via WhatsApp, bukan ke nomor rekening contoh.

### Pelanggan

- Registrasi/login email + kata sandi, hash `scrypt`, cookie sesi HttpOnly bertanda tangan.
  Semua halaman pelanggan dilindungi di server; hanya masuk/daftar/lupa sandi yang publik.
- Dashboard akun, detail pesanan, unggah ulang bukti bayar (maks. 2 MB), dan form ulasan.
- Pesanan hanya dapat dibuat setelah login dan terhubung ke `customer_id`; pelacakan
  pelanggan dibatasi ke resi miliknya (admin dapat melihat semua resi).
- Ulasan hanya untuk pesanan `SELESAI` milik sendiri dan menunggu moderasi admin.

### Admin

- Portal terpisah tanpa header/footer pelanggan; redirect role di server.
- Dashboard, pesanan, pelanggan, pembayaran, pemandu, layanan, bagasi/loker, pelacakan,
  ulasan, dan pengaturan.
- Verifikasi pembayaran, perubahan status, penugasan pemandu, kode segel, catatan admin,
  dan ekspor CSV.
- Semua mutasi diperiksa di server (`requireAdmin`/role check), bukan hanya di UI.

## Arsitektur data & keamanan

- Mode Supabase bila `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` tersedia.
- Mode file `.data/store.json` hanya untuk development/uji; di produksi butuh
  `ALLOW_LOCAL_DB=1` dan tidak disarankan.
- Tanpa database di produksi, aplikasi menampilkan pesan konfigurasi; tidak membuat
  transaksi atau data operasional palsu.
- Tabel aplikasi: pengguna, sesi, pesanan, layanan, pemandu, loker, ulasan, pengaturan.
- Sesi: `ul_session`, HttpOnly, SameSite=Lax, HMAC-SHA256, masa aktif 7 hari.
- Rate limit login/registrasi 8 percobaan per 5 menit per IP.

## Perubahan penting pada fase terakhir

- Cache modul pada pembacaan file lokal dihapus agar route handler dan page tidak
  membaca data basi.
- `listReviews({ published })` ditambahkan; beranda memakai ulasan terbit lebih dulu.
- Label status/pembayaran pelanggan memakai terjemahan `account.status`/`account.payment`.
- Badge penyimpanan admin menampilkan mode nyata (`Supabase` / `Mode lokal`).
- Form rating di halaman bantuan diubah dari tampilan simulasi menjadi pengiriman nyata
  ke `/api/reviews` dengan validasi pesanan selesai, status login, dan pesan error server.
- Label unggah bukti diselaraskan menjadi maksimal 2 MB.
- Nomor WhatsApp resmi pelanggan & admin diperbarui ke `+62 851-4318-0788` (`6285143180788`); hotline status, floating WhatsApp button, dan bantuan memakai nomor yang sama.
- Data contoh pada halaman status dihapus/digeneralisasi: tujuan hotel, kode segel,
  dan checklist segel tidak lagi mengklaim data spesifik yang tidak ada.
- Notifikasi WhatsApp admin menormalkan nomor pelanggan ke format `62…`.
- `README.md` ditambahkan dengan setup, env, deploy, dan hasil pengujian.

## Cara menjalankan

```bash
npm install
copy .env.example .env.local
npm run dev
```

Admin development: `admin@unangloja.id` / `admin12345` (hanya bila env admin tidak diisi).
Ganti kata sandi sebelum produksi.

Build produksi:

```bash
npm run build
npm start
```

## Pengujian yang benar-benar dilakukan

- `npm run build` sukses, TypeScript lolos, 52 route/halaman diproses.
- E2E HTTP 50/50: halaman publik, registrasi/login pelanggan, login admin, redirect role,
  pembatasan akses, pemesanan, daftar/ubah pesanan admin, visibilitas status pelanggan,
  seluruh halaman admin, aksi pemandu/layanan/loker, ulasan, profil, logout.
- Uji API tambahan: penugasan pemandu di `/api/track`, metode pembayaran, ekspor CSV,
  ekspor pelanggan ditolak 401, resi kosong 400, PATCH lintas origin 403, publikasi
  ulasan admin.
- Uji browser: login pelanggan → `/id/akun`; login admin → `/id/admin/dashboard`;
  editor pesanan; verifikasi pembayaran `PENDING → PAID`; status pelanggan.
- Uji browser alur pemesanan lengkap: Penitipan, tanggal, 2 koper, data pelanggan
  terisi otomatis, pilih BSI, unggah bukti PNG, kirim → resi `UL-20261120-6451`
  (`PENDING`); muncul di akun pelanggan dan portal admin.
- Uji form ulasan: pesan error untuk pesanan belum selesai dan sukses untuk pesanan
  `SELESAI` (tersimpan menunggu moderasi).
- Uji beranda: ulasan asli lebih dulu, label “Contoh” pada kartu contoh, catatan campuran.
- Uji status: resi `UL-20261120-6451` menampilkan `PENDING` dan “Total Tagihan”;
  resi `UL-20261119-9629` menampilkan segel `SLG-TEST-01`, pemandu, dan “Total Dibayar”.
- Uji responsif dasar di browser; perangkat fisik belum diuji.

## Batasan yang diketahui

- Pelacakan status manual, bukan GPS real-time.
- Mode file lokal tidak persisten dan tidak cocok untuk Vercel multi-instance.
- Nomor pembayaran dan kredensial admin harus diisi lewat environment produksi.
- Belum ada rangkaian tes otomatis yang di-commit; pengujian di atas dijalankan manual/HTTP.
- Foto arsip 4 sisi belum disimpan di aplikasi; petugas mengirimnya via WhatsApp.
