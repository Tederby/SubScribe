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

-- 3. Split Groups Table (Active Shared Accounts)
create table if not exists split_groups (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  service_name text not null,
  leader_name text not null,
  leader_phone text not null,
  price_per_person numeric(12,2) default 0,
  billing_day integer default 1,
  member_list text -- Comma-separated names, e.g. "Budi, Andi, Siti"
);

-- 4. Initial Seed Data (Indonesian Digital Subscriptions)
-- Insert Categories
insert into categories (id, name) values
  ('c1111111-1111-1111-1111-111111111111', 'Video Streaming'),
  ('c2222222-2222-2222-2222-222222222222', 'Musik'),
  ('c3333333-3333-3333-3333-333333333333', 'Produktivitas AI')
on conflict (id) do nothing;

-- Insert Services
insert into services (id, sku, name, description, category_id, monthly_price, max_slots) values
  (
    's1111111-1111-1111-1111-111111111111',
    'NETFLIX-PREM',
    'Netflix Premium',
    'Paket langganan 4K Ultra HD dengan akses simultan 4 layar.',
    'c1111111-1111-1111-1111-111111111111',
    186000.00,
    4
  ),
  (
    's2222222-2222-2222-2222-222222222222',
    'SPOTIFY-FAM',
    'Spotify Family',
    'Paket musik tanpa iklan untuk hingga 6 akun keluarga.',
    'c2222222-2222-2222-2222-222222222222',
    86900.00,
    6
  ),
  (
    's3333333-3333-3333-3333-333333333333',
    'YOUTUBE-FAM',
    'YouTube Premium Family',
    'Bebas iklan, putar di latar belakang, dan YouTube Music untuk 5 anggota.',
    'c1111111-1111-1111-1111-111111111111',
    139000.00,
    5
  ),
  (
    's4444444-4444-4444-4444-444444444444',
    'CHATGPT-PLUS',
    'ChatGPT Plus Team',
    'Akses GPT-4o, pembuatan gambar DALL-E, dan canvas kolaboratif.',
    'c3333333-3333-3333-3333-333333333333',
    300000.00,
    3
  )
on conflict (sku) do nothing;

-- Insert Sample Split Groups
insert into split_groups (id, group_name, service_name, leader_name, leader_phone, price_per_person, billing_day, member_list) values
  (
    'g1111111-1111-1111-1111-111111111111',
    'Netflix Nonton Bareng',
    'Netflix Premium',
    'Budi Santoso',
    '6281234567890',
    46500.00,
    15,
    'Budi, Andi, Siti, Rizky'
  ),
  (
    'g2222222-2222-2222-2222-222222222222',
    'Spotify Musikan',
    'Spotify Family',
    'Citra Dewi',
    '6289876543210',
    14500.00,
    1,
    'Citra, Eko, Fajar, Gita, Hana, Ian'
  )
on conflict (id) do nothing;

