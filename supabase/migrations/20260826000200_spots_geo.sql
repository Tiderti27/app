-- Macht die PostGIS-Geography (spots.location) fuer PostgREST/supabase-js
-- nutzbar: eine View mit latitude/longitude statt geography-Binaerformat,
-- und eine RPC-Funktion fuer die Umkreissuche (docs/spec.md Abschnitt 11).

create or replace view public.spots_view
with (security_invoker = true)
as
select
  s.id,
  s.name,
  s.description,
  s.category,
  s.address,
  s.city,
  st_y(s.location::geometry) as latitude,
  st_x(s.location::geometry) as longitude,
  s.google_place_id,
  s.phone,
  s.website,
  s.opening_hours,
  s.photos,
  s.score,
  s.score_count,
  s.save_count,
  s.claimed_by,
  s.is_claimed,
  s.created_by,
  s.created_at,
  s.updated_at
from public.spots s;

create or replace function public.spots_nearby(
  lat double precision,
  lng double precision,
  radius_meters double precision default 5000,
  category_filter text default null
)
returns table (
  id uuid,
  name text,
  description text,
  category text,
  address text,
  city text,
  latitude double precision,
  longitude double precision,
  google_place_id text,
  phone text,
  website text,
  opening_hours jsonb,
  photos text[],
  score numeric,
  score_count integer,
  save_count integer,
  claimed_by uuid,
  is_claimed boolean,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  distance_meters double precision
)
language sql
stable
as $$
  select
    s.id, s.name, s.description, s.category, s.address, s.city,
    st_y(s.location::geometry) as latitude,
    st_x(s.location::geometry) as longitude,
    s.google_place_id, s.phone, s.website, s.opening_hours, s.photos,
    s.score, s.score_count, s.save_count, s.claimed_by, s.is_claimed,
    s.created_by, s.created_at, s.updated_at,
    st_distance(s.location, st_makepoint(lng, lat)::geography) as distance_meters
  from public.spots s
  where st_dwithin(s.location, st_makepoint(lng, lat)::geography, radius_meters)
    and (category_filter is null or s.category = category_filter)
  order by distance_meters;
$$;
