-- Fix: "function gen_random_bytes(integer) does not exist" in redeem_promo_code.
--
-- Supabase installiert die Extension pgcrypto standardmaessig ins Schema
-- "extensions", nicht "public". Die Funktion hatte "set search_path = public"
-- gesetzt, wodurch gen_random_bytes() (aus pgcrypto) nicht gefunden wurde.
-- gen_random_uuid() lief trotzdem, weil das seit Postgres 13 ein eingebauter
-- pg_catalog-Befehl ist, kein Extension-Aufruf.

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
