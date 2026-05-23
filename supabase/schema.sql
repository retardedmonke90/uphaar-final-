-- UPHAAR shared database schema
-- Run this inside Supabase SQL editor once before deploying.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null default 0,
  image text default '',
  description text default '',
  stock integer not null default 0,
  emoji text default '🎁',
  featured boolean not null default false,
  is_new_arrival boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  order_number text unique,
  user_id text,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  pincode text,
  subtotal numeric not null default 0,
  shipping numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  coupon_code text,
  tracking_number text,
  notes text,
  customer_info jsonb not null default '{}'::jsonb,
  items_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  name text not null,
  rating integer not null default 5,
  comment text not null default '',
  user_id text,
  product_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id text primary key,
  name text,
  email text,
  phone text,
  subject text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.lucky_spins (
  id text primary key,
  user_identifier text not null,
  spin_date date not null,
  prize_text text not null,
  discount numeric not null default 0,
  min_purchase numeric not null default 0,
  free_shipping boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_identifier, spin_date)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.contacts enable row level security;
alter table public.lucky_spins enable row level security;

-- Public read/write policies for a static storefront using anon key.
-- Replace these with stricter server-side policies later if needed.

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "public write products" on public.products;
create policy "public write products" on public.products for insert with check (true);
drop policy if exists "public update products" on public.products;
create policy "public update products" on public.products for update using (true) with check (true);
drop policy if exists "public delete products" on public.products;
create policy "public delete products" on public.products for delete using (true);

drop policy if exists "public read orders" on public.orders;
create policy "public read orders" on public.orders for select using (true);
drop policy if exists "public write orders" on public.orders;
create policy "public write orders" on public.orders for insert with check (true);
drop policy if exists "public update orders" on public.orders;
create policy "public update orders" on public.orders for update using (true) with check (true);
drop policy if exists "public delete orders" on public.orders;
create policy "public delete orders" on public.orders for delete using (true);

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews for select using (true);
drop policy if exists "public write reviews" on public.reviews;
create policy "public write reviews" on public.reviews for insert with check (true);

drop policy if exists "public write contacts" on public.contacts;
create policy "public write contacts" on public.contacts for insert with check (true);

drop policy if exists "public read lucky spins" on public.lucky_spins;
create policy "public read lucky spins" on public.lucky_spins for select using (true);
drop policy if exists "public write lucky spins" on public.lucky_spins;
create policy "public write lucky spins" on public.lucky_spins for insert with check (true);
