-- Spot: initiales Schema
-- Quelle: docs/spec.md Abschnitt 4

create extension if not exists postgis;
create extension if not exists pgcrypto;

-- 4.1 Users
-- id ist bewusst nicht auto-generiert: er wird 1:1 aus auth.users uebernommen,
-- siehe Trigger public.handle_new_user() in 20260826000100_auth_profile_sync.sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique not null,
  display_name text,
  avatar_url text,
  role text not null check (role in ('consumer', 'creator', 'business')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4.2 Spots (Orte)
create table spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (category in ('food', 'shopping', 'experience', 'nightlife', 'beauty', 'culture')),
  address text not null,
  city text not null,
  location geography(point, 4326) not null,
  google_place_id text,
  phone text,
  website text,
  opening_hours jsonb,
  photos text[] default '{}',

  score numeric(4,1) default 0,
  score_count integer default 0,
  save_count integer default 0,

  claimed_by uuid references users(id),
  is_claimed boolean default false,

  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_spots_location on spots using gist (location);
create index idx_spots_category on spots (category);
create index idx_spots_city on spots (city);
create index idx_spots_score on spots (score desc);

-- 4.3 Ratings (Bewertungen)
create table ratings (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  user_id uuid references users(id),
  score integer not null check (score between 1 and 100),
  comment text,
  created_at timestamptz default now(),

  unique (spot_id, user_id)
);

-- 4.4 Saves (Merkliste)
create table saves (
  user_id uuid references users(id),
  spot_id uuid references spots(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, spot_id)
);

-- 4.5 Videos (Creator-Inhalte)
create table videos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  creator_id uuid references users(id),
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  video_url text not null,
  thumbnail_url text,
  title text,
  is_cooperation boolean default false,
  created_at timestamptz default now()
);

-- 4.6 Business Subscriptions (Laden-Abos)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references users(id),
  tier text not null check (tier in ('basis', 'aktiv', 'premium')),
  stripe_subscription_id text,
  stripe_customer_id text,
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- 4.7 Promotions (Rabattaktionen)
create table promotions (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  business_id uuid references users(id),
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(5,2) not null,

  max_redemptions integer,
  current_redemptions integer default 0,
  valid_from timestamptz not null,
  valid_until timestamptz,
  is_active boolean default true,

  created_at timestamptz default now()
);

-- 4.8 Promo Codes (Creator-Codes)
create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid references promotions(id) on delete cascade,
  creator_id uuid references users(id),
  code text not null,
  is_active boolean default true,
  created_at timestamptz default now(),

  unique (code)
);

-- 4.9 Redemptions (Code-Einloesungen)
create table redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid references promo_codes(id),
  promotion_id uuid references promotions(id),
  user_id uuid references users(id),
  creator_id uuid references users(id),
  spot_id uuid references spots(id),

  qr_token text unique not null,
  qr_expires_at timestamptz not null,
  fallback_code text,

  status text not null check (status in ('generated', 'redeemed', 'expired')),
  redeemed_at timestamptz,
  redeemed_by_staff text,

  creator_payout numeric(5,2) default 0.50,
  platform_fee numeric(5,2) default 0.50,

  created_at timestamptz default now(),

  unique (promotion_id, user_id)
);

-- 4.10 Creator Payouts (Auszahlungen)
create table creator_payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references users(id),
  amount numeric(8,2) not null,
  redemption_count integer not null,
  period_start date not null,
  period_end date not null,
  status text check (status in ('pending', 'paid', 'failed')),
  stripe_transfer_id text,
  created_at timestamptz default now()
);
