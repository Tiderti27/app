-- Zweite Ausbaustufe (docs/spec.md Abschnitt 15, Punkte 8-10):
-- Rabattcode-System (Abschnitt 5), Profilaufruf-Tracking, Statistik-RPCs
-- fuer Laden- und Creator-Dashboards.

-- 1) promo_codes: Sichtbarkeit einschraenken. Der oeffentliche Code darf laut
-- Spec NICHT einfach abfragbar sein -- nur der eigene Creator und der Laden,
-- dem die Aktion gehoert, duerfen ihn sehen. Auch die Erstellung passiert
-- durch den Laden (er verknuepft eine Aktion mit einem Creator), nicht durch
-- den Creator selbst.
drop policy if exists "promo_codes_select_authenticated" on promo_codes;
drop policy if exists "promo_codes_creator_insert" on promo_codes;

create policy "promo_codes_select_related" on promo_codes
  for select to authenticated using (
    creator_id = auth.uid()
    or exists (
      select 1 from promotions p
      where p.id = promo_codes.promotion_id and p.business_id = auth.uid()
    )
  );

create policy "promo_codes_business_insert" on promo_codes
  for insert to authenticated with check (
    exists (
      select 1 from promotions p
      where p.id = promo_codes.promotion_id and p.business_id = auth.uid()
    )
  );

create policy "promo_codes_business_update" on promo_codes
  for update to authenticated
  using (
    exists (
      select 1 from promotions p
      where p.id = promo_codes.promotion_id and p.business_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from promotions p
      where p.id = promo_codes.promotion_id and p.business_id = auth.uid()
    )
  );

-- 2) spot_views: einfaches Aufruf-Tracking fuer "Profilaufrufe" im
-- Laden-Dashboard. Kein Client hat direkten Zugriff -- nur ueber die
-- SECURITY DEFINER RPCs unten.
create table spot_views (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  viewer_id uuid references users(id),
  created_at timestamptz default now()
);

create index idx_spot_views_spot on spot_views (spot_id);
create index idx_spot_views_created on spot_views (created_at);

alter table spot_views enable row level security;
-- bewusst keine Policies: ausschliesslich ueber log_spot_view()/business_stats() erreichbar.

create or replace function public.log_spot_view(p_spot_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into spot_views (spot_id, viewer_id) values (p_spot_id, auth.uid());
$$;

-- 3) Rabattcode-Ablauf (docs/spec.md Abschnitt 5)

create or replace function public.redeem_promo_code(p_code text)
returns table (
  id uuid,
  promotion_id uuid,
  spot_id uuid,
  qr_token text,
  qr_expires_at timestamptz,
  fallback_code text,
  status text,
  discount_type text,
  discount_value numeric,
  spot_name text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code promo_codes%rowtype;
  v_promo promotions%rowtype;
  v_existing redemptions%rowtype;
  v_token text;
  v_fallback text;
  v_expires timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;

  select * into v_code from promo_codes pc
    where upper(pc.code) = upper(trim(p_code)) and pc.is_active
    limit 1;
  if v_code.id is null then
    raise exception 'Code ungueltig';
  end if;

  select * into v_promo from promotions where promotions.id = v_code.promotion_id;
  if v_promo.id is null or not v_promo.is_active then
    raise exception 'Aktion nicht mehr aktiv';
  end if;
  if v_promo.valid_from > now() then
    raise exception 'Aktion noch nicht gestartet';
  end if;
  if v_promo.valid_until is not null and v_promo.valid_until < now() then
    raise exception 'Aktion abgelaufen';
  end if;
  if v_promo.max_redemptions is not null and v_promo.current_redemptions >= v_promo.max_redemptions then
    raise exception 'Aktion ausgeschoepft';
  end if;

  select * into v_existing from redemptions r
    where r.promotion_id = v_promo.id and r.user_id = auth.uid();

  if v_existing.id is not null and v_existing.status = 'redeemed' then
    raise exception 'Bereits eingeloest';
  end if;

  if v_existing.id is not null and v_existing.status = 'generated' and v_existing.qr_expires_at > now() then
    return query
      select v_existing.id, v_existing.promotion_id, v_existing.spot_id, v_existing.qr_token,
        v_existing.qr_expires_at, v_existing.fallback_code, v_existing.status,
        v_promo.discount_type, v_promo.discount_value,
        (select s.name from spots s where s.id = v_existing.spot_id);
    return;
  end if;

  v_token := encode(gen_random_bytes(16), 'hex');
  v_fallback := lpad(floor(random() * 10000)::text, 4, '0');
  v_expires := now() + interval '15 minutes';

  if v_existing.id is not null then
    update redemptions
      set qr_token = v_token, qr_expires_at = v_expires, fallback_code = v_fallback, status = 'generated'
      where redemptions.id = v_existing.id
      returning * into v_existing;
  else
    insert into redemptions (
      promo_code_id, promotion_id, user_id, creator_id, spot_id,
      qr_token, qr_expires_at, fallback_code, status
    ) values (
      v_code.id, v_promo.id, auth.uid(), v_code.creator_id, v_promo.spot_id,
      v_token, v_expires, v_fallback, 'generated'
    )
    returning * into v_existing;
  end if;

  return query
    select v_existing.id, v_existing.promotion_id, v_existing.spot_id, v_existing.qr_token,
      v_existing.qr_expires_at, v_existing.fallback_code, v_existing.status,
      v_promo.discount_type, v_promo.discount_value,
      (select s.name from spots s where s.id = v_existing.spot_id);
end;
$$;

create or replace function public.scan_redemption(p_qr_token text default null, p_fallback_code text default null)
returns table (
  id uuid,
  status text,
  spot_name text,
  promotion_title text,
  discount_type text,
  discount_value numeric,
  redeemed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_redemption redemptions%rowtype;
  v_promo promotions%rowtype;
  v_spot spots%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;

  if p_qr_token is not null then
    select * into v_redemption from redemptions where redemptions.qr_token = p_qr_token;
  elsif p_fallback_code is not null then
    select * into v_redemption from redemptions
      where redemptions.fallback_code = p_fallback_code and redemptions.status = 'generated'
      order by created_at desc
      limit 1;
  else
    raise exception 'Kein Code angegeben';
  end if;

  if v_redemption.id is null then
    raise exception 'Code nicht gefunden';
  end if;

  select * into v_spot from spots where spots.id = v_redemption.spot_id;
  select * into v_promo from promotions where promotions.id = v_redemption.promotion_id;

  if v_spot.claimed_by is distinct from auth.uid() and v_promo.business_id is distinct from auth.uid() then
    raise exception 'Keine Berechtigung fuer diesen Laden';
  end if;

  if v_redemption.status = 'redeemed' then
    raise exception 'Code bereits eingeloest';
  end if;

  if v_redemption.status = 'generated' and v_redemption.qr_expires_at < now() then
    update redemptions set status = 'expired' where redemptions.id = v_redemption.id;
    raise exception 'Code abgelaufen';
  end if;

  update redemptions
    set status = 'redeemed', redeemed_at = now(), redeemed_by_staff = auth.uid()::text
    where redemptions.id = v_redemption.id
    returning * into v_redemption;

  update promotions set current_redemptions = current_redemptions + 1 where promotions.id = v_redemption.promotion_id;

  return query
    select v_redemption.id, v_redemption.status, v_spot.name, v_promo.title,
      v_promo.discount_type, v_promo.discount_value, v_redemption.redeemed_at;
end;
$$;

create or replace function public.business_redemptions_today()
returns table (
  id uuid,
  spot_name text,
  creator_username text,
  discount_type text,
  discount_value numeric,
  redeemed_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.id, s.name, u.username, p.discount_type, p.discount_value, r.redeemed_at
  from redemptions r
  join promotions p on p.id = r.promotion_id
  join spots s on s.id = r.spot_id
  left join users u on u.id = r.creator_id
  where p.business_id = auth.uid()
    and r.status = 'redeemed'
    and r.redeemed_at::date = now()::date
  order by r.redeemed_at desc;
$$;

-- 4) Statistik-RPCs fuer Laden- und Creator-Dashboard (docs/spec.md 7.2/7.1)

create or replace function public.business_stats(p_days integer default 7)
returns table (
  profile_views bigint,
  saves_total bigint,
  active_promotions bigint,
  redemptions_period bigint,
  top_creator_username text,
  top_creator_redemptions bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business uuid := auth.uid();
begin
  if v_business is null then
    raise exception 'Nicht angemeldet';
  end if;

  return query
  with my_spots as (
    select id from spots where claimed_by = v_business
  ),
  my_promotions as (
    select id from promotions where business_id = v_business
  ),
  views as (
    select count(*) as c from spot_views sv
    where sv.spot_id in (select id from my_spots)
      and sv.created_at > now() - make_interval(days => p_days)
  ),
  saves as (
    select coalesce(sum(s.save_count), 0) as c from spots s where s.claimed_by = v_business
  ),
  promos as (
    select count(*) as c from promotions where business_id = v_business and is_active = true
  ),
  reds as (
    select count(*) as c from redemptions r
    where r.promotion_id in (select id from my_promotions)
      and r.status = 'redeemed'
      and r.redeemed_at > now() - make_interval(days => p_days)
  ),
  top as (
    select u.username, count(*) as cnt
    from redemptions r
    join users u on u.id = r.creator_id
    where r.promotion_id in (select id from my_promotions)
      and r.status = 'redeemed'
    group by u.username
    order by cnt desc
    limit 1
  )
  select
    (select c from views),
    (select c from saves),
    (select c from promos),
    (select c from reds),
    (select username from top),
    (select cnt from top);
end;
$$;

create or replace function public.business_creator_breakdown(p_days integer default 30)
returns table (
  creator_username text,
  redemption_count bigint
)
language sql
security definer
set search_path = public
as $$
  select u.username, count(*) as redemption_count
  from redemptions r
  join promotions p on p.id = r.promotion_id
  join users u on u.id = r.creator_id
  where p.business_id = auth.uid()
    and r.status = 'redeemed'
    and r.redeemed_at > now() - make_interval(days => p_days)
  group by u.username
  order by redemption_count desc;
$$;

create or replace function public.creator_stats()
returns table (
  total_redemptions bigint,
  total_earnings numeric,
  active_cooperations bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid := auth.uid();
begin
  if v_creator is null then
    raise exception 'Nicht angemeldet';
  end if;

  return query
  select
    coalesce((select count(*) from redemptions where creator_id = v_creator and status = 'redeemed'), 0),
    coalesce((select sum(creator_payout) from redemptions where creator_id = v_creator and status = 'redeemed'), 0),
    coalesce((select count(distinct promotion_id) from promo_codes where creator_id = v_creator and is_active = true), 0);
end;
$$;
