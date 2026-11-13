-- ============================================================
-- UNANG LOJA — Skema Database Fase 2A
-- Cara pakai: buka Supabase → SQL Editor → paste semua → Run
-- ============================================================

-- Tabel pemandu wisata
create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,              -- format 62xxx (tanpa +)
  specialty text not null default 'budaya',
  languages text not null default 'ID, EN',
  rating numeric(2,1) not null default 5.0,
  years int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tabel pesanan
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  resi text unique not null,                    -- UL-20261113-1234
  service_key text not null,                    -- penitipan | antarDekat | antarLintas | pemanduan | fleksibel | mystery
  add_ons text[] not null default '{}',
  date date not null,                           -- tanggal layanan
  meeting_point text not null,
  zone text,
  suitcases int not null default 1,
  participants int not null default 1,
  notes text,
  name text not null,                           -- nama pemesan
  phone text not null,                          -- WA pemesan, format 62xxx
  email text,
  payment_method text,
  total bigint not null default 0,              -- total dalam rupiah
  status text not null default 'BARU',          -- lihat ORDER_STATUS di bawah
  guide_id uuid references guides(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Status yang diizinkan (dicek oleh aplikasi):
--   BARU            : pesanan masuk, menunggu admin
--   DIKONFIRMASI    : admin sudah konfirmasi ke pemesan
--   DITUGASKAN      : pemandu/petugas sudah ditugaskan
--   DIJEMPUT        : bagasi sedang dijemput/di proses
--   SELESAI         : layanan selesai
--   BATAL           : dibatalkan

-- Index untuk pencarian resi cepat
create index if not exists orders_resi_idx on orders (resi);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

-- Row Level Security: kunci penuh.
-- Semua akses lewat server (service role key) — tidak ada akses publik anonim.
alter table orders enable row level security;
alter table guides enable row level security;
