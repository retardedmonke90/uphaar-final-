
-- UPHAAR production schema
-- Run this in Supabase SQL editor before deploying the app.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  image text not null default '',
  description text not null default '',
  stock integer not null default 0,
  emoji text not null default '🎁',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid null,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  pincode text not null,
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  coupon_code text,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  price numeric(10,2) not null,
  quantity integer not null default 1,
  image text not null default '',
  category text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  user_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lucky_draw_spins (
  id uuid primary key default gen_random_uuid(),
  user_identifier text not null,
  spin_date date not null,
  prize_text text not null,
  discount numeric(10,2) not null default 0,
  min_purchase numeric(10,2) not null default 0,
  free_shipping boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_identifier, spin_date)
);

create table if not exists public.coupons (
  code text primary key,
  discount numeric(10,2) not null default 0,
  min_purchase numeric(10,2) not null default 0,
  free_shipping boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_email on public.orders(email);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);
create index if not exists idx_contact_created_at on public.contact_messages(created_at desc);
create index if not exists idx_spins_user_date on public.lucky_draw_spins(user_identifier, spin_date);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_products_updated_at on public.products;
create trigger touch_products_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists touch_orders_updated_at on public.orders;
create trigger touch_orders_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.contact_messages enable row level security;
alter table public.lucky_draw_spins enable row level security;
alter table public.coupons enable row level security;
alter table public.profiles enable row level security;

-- Public data is intentionally read-only from the browser. The edge function uses the service role.
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews for select using (true);

drop policy if exists "public read coupons" on public.coupons;
create policy "public read coupons" on public.coupons for select using (true);

-- Authenticated users can read their own profile.
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- Seed a simple admin role example by setting role=admin manually in profiles if needed.
