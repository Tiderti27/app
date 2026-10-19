-- Fix: "column reference ... is ambiguous" in redeem_promo_code/scan_redemption.
--
-- Beide Funktionen sind PL/pgSQL mit "returns table(id ..., status ..., ...)".
-- Postgres erzeugt daraus implizite OUT-Variablen mit genau diesen Namen, die
-- im gesamten Funktionskoerper sichtbar sind. Unqualifizierte Spalten wie
-- "where id = ..." oder "where status = '...'" sind dadurch mehrdeutig
-- (Tabellenspalte vs. OUT-Variable) -- hier mit Tabellennamen qualifiziert.

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
set search_path = public
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
