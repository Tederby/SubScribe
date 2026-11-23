-- SubScribe Database Schema (Supabase PostgreSQL)
-- 3-Table Relational Model: categories, services, split_groups

-- 1. Categories Table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- 2. Services Table (Catalog of Digital Subscriptions)
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  monthly_price numeric(12,2) default 0,
  max_slots integer default 1
);

-- 3. Users Table (Lightweight Credentials for Operator / Admin Auth)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text default 'operator',
  created_at timestamp with time zone default now()
);

-- 4. Split Groups Table (Active Shared Accounts, Managed per User)
create table if not exists split_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  group_name text not null,
  service_name text not null,
  leader_name text not null,
  leader_phone text default '', -- Opsional, format baku Indonesia: 628xxx
  price_per_person numeric(12,2) default 0,
  billing_day integer default 1,
  member_list text, -- Comma-separated names, e.g. "Budi, Andi, Siti"
  paid_members text default '' -- Comma-separated paid members for cycle tracking
);

-- Access Grants & Permissions for API (Bypasses RLS blocks for educational backend MVC)
alter table categories disable row level security;
alter table services disable row level security;
alter table split_groups disable row level security;
alter table users disable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- 5. Initial Seed Data (Indonesian Digital Subscriptions & Operator)
-- Insert Seed Operator (Password: admin123)
insert into users (id, email, password_hash, name, role) values
  ('u1111111-1111-1111-1111-111111111111', 'admin@subscribe.local', 'a1b2c3d4e5f60718:bb2b5e7fe90a5873b38e440bdb252b705addf3bcf8a822a14f03c6a98d17e8376d0d85c118f6a5e820bc7e84d778197b1d9450e44ca6f1a4e9db1a0b4f44b0f7', 'Operator Admin', 'operator')
on conflict (email) do nothing;
-- Insert Categories
insert into categories (id, name) values
  ('c1111111-1111-1111-1111-111111111111', 'Video Streaming'),
  ('c2222222-2222-2222-2222-222222222222', 'Musik'),
  ('c3333333-3333-3333-3333-333333333333', 'Produktivitas AI'),
  ('c4444444-4444-4444-4444-444444444444', 'Cloud & Storage'),
  ('c5555555-5555-5555-5555-555555555555', 'Gaming & Edukasi')
on conflict (id) do nothing;

-- Insert Services (Expanded Realistic Catalog)
insert into services (id, sku, name, description, category_id, monthly_price, max_slots) values
  (
    'a1111111-1111-1111-1111-111111111111',
    'NETFLIX-PREM',
    'Netflix Premium',
    'Paket langganan 4K Ultra HD + HDR dengan akses simultan 4 layar dan profil mandiri.',
    'c1111111-1111-1111-1111-111111111111',
    186000.00,
    4
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'SPOTIFY-FAM',
    'Spotify Family',
    'Paket musik lossless bebas iklan untuk hingga 6 akun keluarga terpisah.',
    'c2222222-2222-2222-2222-222222222222',
    86900.00,
    6
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'YOUTUBE-FAM',
    'YouTube Premium Family',
    'Bebas iklan, putar di latar belakang, dan YouTube Music Premium untuk 5 anggota.',
    'c1111111-1111-1111-1111-111111111111',
    139000.00,
    5
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'CHATGPT-PLUS',
    'ChatGPT Plus Team',
    'Akses GPT-4o tanpa batas, DALL-E 3, pembuatan custom GPTs, dan workspace kolaboratif.',
    'c3333333-3333-3333-3333-333333333333',
    300000.00,
    3
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'DISNEY-PREM',
    'Disney+ Hotstar Premium',
    'Streaming 4K Ultra HD film Marvel, Disney, Pixar, dan serial lokal hingga 3 layar aktif.',
    'c1111111-1111-1111-1111-111111111111',
    119000.00,
    3
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'CANVA-TEAM',
    'Canva Pro Team',
    'Desain profesional kolaboratif, Brand Kit premium, Magic Switch AI untuk 5 seat.',
    'c3333333-3333-3333-3333-333333333333',
    124000.00,
    5
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    'APPLE-ONE-PREM',
    'Apple One Premier',
    'Apple Music, Apple TV+, Apple Arcade, dan iCloud+ 2TB berbagi hingga 6 anggota.',
    'c4444444-4444-4444-4444-444444444444',
    159000.00,
    6
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'GOOGLE-ONE-2TB',
    'Google One 2TB Family',
    'Penyimpanan cloud Google Photos dan Drive bersama 5 anggota keluarga + Gemini Advanced.',
    'c4444444-4444-4444-4444-444444444444',
    135000.00,
    5
  ),
  (
    'a9999999-9999-9999-9999-999999999999',
    'PRIME-VIDEO',
    'Amazon Prime Video',
    'Serial original The Boys, Rings of Power, resolusi 4K HDR dengan 3 layar simultan.',
    'c1111111-1111-1111-1111-111111111111',
    59000.00,
    3
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'NINTENDO-FAM',
    'Nintendo Switch Online Family',
    'Akses multiplayer online Nintendo Switch, cloud save, dan katalog retro game 8 akun.',
    'c5555555-5555-5555-5555-555555555555',
    65000.00,
    8
  ),
  (
    'abbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'DUOLINGO-FAM',
    'Duolingo Super Family',
    'Belajar bahasa bebas iklan, nyawa tanpa batas, dan Family Quest untuk 6 anggota.',
    'c5555555-5555-5555-5555-555555555555',
    149000.00,
    6
  ),
  (
    'accccccc-cccc-cccc-cccc-cccccccccccc',
    'MIDJOURNEY-STD',
    'Midjourney Standard',
    'Akses fast GPU generation 15 jam/bulan, relax GPU unlimited, dan shared gallery 3 seat.',
    'c3333333-3333-3333-3333-333333333333',
    450000.00,
    3
  )
on conflict (sku) do nothing;

-- Insert Sample Split Groups
insert into split_groups (id, user_id, group_name, service_name, leader_name, leader_phone, price_per_person, billing_day, member_list, paid_members) values
  (
    'b1111111-1111-1111-1111-111111111111',
    'u1111111-1111-1111-1111-111111111111',
    'Netflix Nonton Bareng Kos',
    'Netflix Premium',
    'Budi Santoso',
    '6281234567890',
    46500.00,
    15,
    'Budi Santoso, Andi Pratama, Siti Nurhaliza, Rizky Ramadhan',
    'Budi Santoso, Andi Pratama'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'u1111111-1111-1111-1111-111111111111',
    'Spotify Musikan Circle',
    'Spotify Family',
    'Citra Dewi',
    '6289876543210',
    14500.00,
    1,
    'Citra Dewi, Eko Nugroho, Fajar Setiawan, Gita Savitri, Hana Pratiwi, Ian Kasela',
    'Citra Dewi, Eko Nugroho, Fajar Setiawan'
  )
on conflict (id) do nothing;

