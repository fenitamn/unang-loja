# SPEC — Website "UNANG LOJA"

Tour guide lokal + penitipan & antar bagasi di Pulau Samosir, Danau Toba.
Tagline: **"Jelajah Tanpa Koper"**.

## Stack

- Next.js (TypeScript) + Tailwind CSS
- Supabase (Fase 2+)
- next-intl (Indonesia & Inggris)
- Mobile-first, desain sederhana & hangat, nuansa Danau Toba (biru danau, aksen merah-hitam-putih ulos)

## Layanan & Tarif

Disimpan di database/admin (Fase 2+), **tidak di-hardcode** ke logika bisnis:

| Layanan | Tarif |
|---|---|
| Pemanduan setengah hari | Rp300.000 |
| Penitipan bagasi | Rp25.000/koper/hari |
| Antar bagasi zona dekat | Rp75.000 |
| Antar bagasi zona lintas | Rp150.000 |
| Jelajah Fleksibel (pemandu + 1x antar zona dekat) | Rp350.000 |
| Mystery Tour (tema Jejak Situs / Senja Danau) | Rp350.000, urutan lokasi dibuka H-1 |

## Halaman

- Beranda
- Layanan
- Profil Pemandu (dengan kalender ketersediaan)
- Pemesanan 4 langkah: pilih layanan (upsell/cross-sell) → tanggal & lokasi → data pelanggan + kode referensi opsional → pembayaran
- Pembayaran manual: transfer/dompet digital + unggah bukti, **tanpa payment gateway**
- Status Pesanan & Bagasi: resi + nomor segel, diperbarui manual oleh admin (bukan GPS)
- Bantuan & Ulasan: FAQ, tombol WhatsApp, rating 1–5
- Admin (login): verifikasi bayar, ubah status, kelola pemandu/harga/mitra, rekap harian

## Aturan Bisnis

- Pesanan lunas mengunci slot pemandu
- Kuota penitipan 20 koper/hari
- Nomor pesanan & resi otomatis
- Kode referensi hanya dicatat, tanpa diskon

## Fase

1. **Fase 1** — Semua halaman publik dengan data dummy, 2 bahasa, responsif
2. **Fase 2** — Database + pemesanan + pembayaran + resi + status
3. **Fase 3** — Panel admin + aturan bisnis
4. **Fase 4** — Ulasan, referral, SEO, README deploy

## Rujukan

Rancangan mengacu pada proposal PKM-K "UNANG LOJA: Platform Tour Guide Lokal dan
Penitipan Bagasi 'Jelajah Tanpa Koper' di Pulau Samosir, Danau Toba" (Bab 3.2 —
Perancangan Channel Web/Mobile, Dedicated E-commerce).
