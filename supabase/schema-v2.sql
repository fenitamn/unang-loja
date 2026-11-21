-- ============================================================
-- UNANG LOJA — Skema Fase 2B (Admin Portal + Akun Pelanggan)
-- Jalankan SETELAH supabase/schema.sql (Fase 2A).
-- Supabase → SQL Editor → paste semua → Run. Aman dijalankan ulang.
-- ============================================================

-- ---------- Akun (customer & admin) ----------
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text not null default '',
  password_hash text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

alter table app_users enable row level security;
-- Tidak ada policy: hanya service role (server) yang boleh mengakses.

-- ---------- Kolom tambahan pesanan ----------
alter table orders add column if not exists customer_id uuid references app_users(id) on delete set null;
alter table orders add column if not exists payment_status text not null default 'UNPAID';
alter table orders add column if not exists payment_proof text;
alter table orders add column if not exists payment_ref text;
alter table orders add column if not exists payment_note text;
alter table orders add column if not exists admin_note text;
alter table orders add column if not exists seal_code text;
alter table orders add column if not exists verified_at timestamptz;
alter table orders add column if not exists verified_by text;
alter table orders add column if not exists updated_at timestamptz not null default now();

create index if not exists orders_customer_idx on orders (customer_id);
create index if not exists orders_payment_idx on orders (payment_status);

-- ---------- Kolom tambahan pemandu ----------
alter table guides add column if not exists slug text;
alter table guides add column if not exists category text not null default 'history';
alter table guides add column if not exists area text not null default 'tomok';
alter table guides add column if not exists price bigint not null default 300000;
alter table guides add column if not exists license text not null default 'DPC HPI Samosir';
alter table guides add column if not exists schedule text not null default '08:00 - 16:00 WIB';
alter table guides add column if not exists reviews int not null default 0;
alter table guides add column if not exists scene text not null default 'guide';
alter table guides add column if not exists avatar_class text not null default 'bg-navy-800';

create unique index if not exists guides_slug_uidx on guides (slug);

insert into guides (slug, name, phone, specialty, languages, rating, years, active, category, area, price, license, schedule, reviews, scene, avatar_class)
values
  ('g1','Amang Johanes Situmorang','','history','ID, EN',4.9,18,true,'history','tomok',300000,'DPC HPI Samosir','08:00 - 16:00 WIB',128,'guide','bg-navy-800'),
  ('g2','Inang Rosmaida Nainggolan','','culinary','ID, EN',4.8,11,true,'culinary','tuktuk',320000,'DPC HPI Samosir','09:00 - 17:00 WIB',96,'culinary','bg-brand-800'),
  ('g3','Pariban Lae Ucok Simbolon','','nature','ID, EN',4.9,9,true,'nature','pusuk',350000,'DPC HPI Samosir','07:00 - 15:00 WIB',143,'lake','bg-lake-800'),
  ('g4','Opung Marlon Tambunan','','photo','ID, EN',4.7,14,true,'photo','tomok',330000,'DPC HPI Samosir','08:00 - 16:00 WIB',87,'photo','bg-gold-700'),
  ('g5','Namboru Sarah Hutapea','','architecture','ID, EN',4.8,7,true,'architecture','ambarita',300000,'DPC HPI Samosir','10:00 - 18:00 WIB',74,'village','bg-navy-700'),
  ('g6','Bapa Togar Siregar','','history','ID, EN',4.9,20,true,'history','balige',360000,'DPC HPI Samosir','08:00 - 16:00 WIB',201,'heritage','bg-brand-700'),
  ('g7','Inang Tiur Simanjuntak','','culinary','ID, EN',4.6,6,true,'culinary','tuktuk',280000,'DPC HPI Samosir','11:00 - 19:00 WIB',58,'market','bg-gold-800'),
  ('g8','Anak Amang Dodi Sihombing','','nature','ID, EN',4.8,12,true,'nature','pusuk',340000,'DPC HPI Samosir','06:00 - 14:00 WIB',112,'trail','bg-lake-700'),
  ('g9','Namboru Debora Manurung','','photo','ID, EN',4.7,5,true,'photo','ambarita',290000,'DPC HPI Samosir','09:00 - 17:00 WIB',49,'sunset','bg-brand-900')
on conflict (slug) do nothing;

-- ---------- Ulasan pelanggan ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete set null,
  order_resi text,
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;

-- ---------- Loker (kapasitas operasional) ----------
create table if not exists lockers (
  id text primary key,
  name text not null,
  location text not null,
  officer text not null default '',
  capacity int not null default 20,
  keys int not null default 20,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table lockers enable row level security;

insert into lockers (id, name, location, officer, capacity, keys)
values
  ('lk-tomok','Loker Hub Tomok','Dermaga Tomok','Petugas Tomok',32,32),
  ('lk-ambarita','Loker Hub Ambarita','Dermaga Ambarita','Petugas Ambarita',24,24),
  ('lk-balige','Loker Hub Balige','Pelabuhan Balige','Petugas Balige',20,20)
on conflict (id) do nothing;

-- ---------- Ketersediaan layanan ----------
create table if not exists services (
  key text primary key,
  active boolean not null default true
);
alter table services enable row level security;

insert into services (key, active)
values
  ('pemanduan',true),('penitipan',true),('antarDekat',true),
  ('antarLintas',true),('fleksibel',true),('mystery',true)
on conflict (key) do nothing;

-- ---------- Admin pertama ----------
-- Dibuat otomatis oleh aplikasi saat login admin pertama,
-- menggunakan env ADMIN_EMAIL + ADMIN_PASSWORD (min. 8 karakter).
-- Tidak ada password default di produksi.
