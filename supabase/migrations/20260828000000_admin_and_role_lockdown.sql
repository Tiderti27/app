-- Rollen-Haertung + Admin-Zugang + Creator-Bewerbung.
--
-- Hintergrund: aktuell kann jeder eingeloggte Account im Web-Dashboard
-- (egal welche Rolle) alle Business-Funktionen nutzen, weil AuthGate nur auf
-- "eingeloggt", nicht auf role = 'business' prueft. Ausserdem erlaubt die
-- bisherige RLS-Policy "users_update_own" das Selbst-Zuweisen JEDER Rolle
-- (auch 'business') ueber ein einfaches Table-Update. Diese Migration:
--   1. sperrt die role-Spalte fuer Selbst-Updates,
--   2. fuehrt is_admin ein: ein Plattform-Admin sieht/aendert ueber eigene
--      RPCs Dinge ueber alle Businesses hinweg, unabhaengig von role,
--   3. ersetzt den direkten "Werde Creator"-Schalter durch eine Bewerbung
--      (Social-Media-Accounts angeben), die der Admin-Account freigeben
--      oder ablehnen muss, bevor die Rolle tatsaechlich wechselt.

alter table users add column is_admin boolean not null default false;

-- Eigenen Account als ersten Admin markieren. Weitere Admins spaeter per
-- "update users set is_admin = true where email = '...';" im SQL-Editor
-- ergaenzen.
update users set is_admin = true where email = 'tim.beisswenger3@gmail.com';

-- 1) role-Spalte vor Selbst-Updates schuetzen: Nutzer duerfen weiterhin ihre
-- eigenen Stammdaten aendern, aber nicht mehr ihre Rolle. Rollenwechsel
-- laufen ab jetzt ausschliesslich ueber SECURITY DEFINER-Funktionen.
revoke update on users from authenticated;
grant update (username, display_name, avatar_url) on users to authenticated;

-- Creator-Bewerbung (docs/spec.md Abschnitt 9: Creator muessen sich anmelden
-- und ihre Accounts verknuepfen). Statt eines sofortigen Rollenwechsels
-- reicht der Nutzer seine Social-Media-Accounts ein; ein Admin prueft und
-- gibt frei.
create table creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  tiktok_handle text,
  instagram_handle text,
  youtube_handle text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_creator_applications_user on creator_applications (user_id);

alter table creator_applications enable row level security;

create policy "creator_applications_select_own_or_admin" on creator_applications
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

-- Insert/Update laufen ausschliesslich ueber die SECURITY DEFINER-Funktionen
-- unten -- bewusst keine Insert/Update-Policy fuer normale Nutzer.

create or replace function public.apply_for_creator(
  p_tiktok text default null,
  p_instagram text default null,
  p_youtube text default null,
  p_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;

  select role into v_role from users where id = auth.uid();
  if v_role is distinct from 'consumer' then
    raise exception 'Nur Nutzer-Konten koennen sich als Creator bewerben';
  end if;

  if exists (select 1 from creator_applications where user_id = auth.uid() and status = 'pending') then
    raise exception 'Es liegt bereits eine Bewerbung vor';
  end if;

  if coalesce(trim(p_tiktok), '') = '' and coalesce(trim(p_instagram), '') = '' and coalesce(trim(p_youtube), '') = '' then
    raise exception 'Bitte mindestens einen Social-Media-Account angeben';
  end if;

  insert into creator_applications (user_id, tiktok_handle, instagram_handle, youtube_handle, message)
  values (auth.uid(), nullif(trim(p_tiktok), ''), nullif(trim(p_instagram), ''), nullif(trim(p_youtube), ''), nullif(trim(p_message), ''));
end;
$$;

create or replace function public.admin_review_creator_application(p_application_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application creator_applications%rowtype;
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin) then
    raise exception 'Keine Admin-Berechtigung';
  end if;

  select * into v_application from creator_applications where id = p_application_id;
  if v_application.id is null then
    raise exception 'Bewerbung nicht gefunden';
  end if;
  if v_application.status <> 'pending' then
    raise exception 'Bewerbung wurde bereits bearbeitet';
  end if;

  update creator_applications
    set status = case when p_approve then 'approved' else 'rejected' end,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_application_id;

  if p_approve then
    update users set role = 'creator' where id = v_application.user_id;
  end if;
end;
$$;

-- 2) Admin-RPCs: alles ueber auth.uid()'s is_admin-Flag abgesichert, nie
-- ueber die Rolle selbst (eine business-Rolle soll kein Admin-Recht geben).

create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin) then
    raise exception 'Keine Admin-Berechtigung';
  end if;
  if p_role not in ('consumer', 'creator', 'business') then
    raise exception 'Ungueltige Rolle';
  end if;

  update users set role = p_role where id = p_user_id;
end;
$$;

create or replace function public.admin_set_admin_flag(p_user_id uuid, p_is_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin) then
    raise exception 'Keine Admin-Berechtigung';
  end if;

  update users set is_admin = p_is_admin where id = p_user_id;
end;
$$;

create or replace function public.admin_business_overview()
returns table (
  business_id uuid,
  username text,
  spot_id uuid,
  spot_name text,
  active_promotions bigint,
  redemptions_total bigint,
  saves_total integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin) then
    raise exception 'Keine Admin-Berechtigung';
  end if;

  return query
  select
    u.id,
    u.username,
    s.id,
    s.name,
    coalesce((select count(*) from promotions p where p.business_id = u.id and p.is_active), 0),
    coalesce((select count(*) from redemptions r
      join promotions p on p.id = r.promotion_id
      where p.business_id = u.id and r.status = 'redeemed'), 0),
    coalesce(s.save_count, 0)
  from users u
  left join spots s on s.claimed_by = u.id
  where u.role = 'business'
  order by u.created_at desc;
end;
$$;

-- 3) Bestehende Policies auf Business-interne Tabellen fuer Admins oeffnen,
-- damit admin_business_overview() & Co. nicht die einzige Sicht bleiben und
-- ein Admin bei Bedarf auch direkt nachschauen/eingreifen kann.

alter policy "promo_codes_select_related" on promo_codes
  using (
    creator_id = auth.uid()
    or exists (select 1 from promotions p where p.id = promo_codes.promotion_id and p.business_id = auth.uid())
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

alter policy "promo_codes_business_update" on promo_codes
  using (
    exists (select 1 from promotions p where p.id = promo_codes.promotion_id and p.business_id = auth.uid())
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  )
  with check (
    exists (select 1 from promotions p where p.id = promo_codes.promotion_id and p.business_id = auth.uid())
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

alter policy "promotions_owner_update" on promotions
  using (business_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.is_admin))
  with check (business_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.is_admin));

alter policy "spots_update_owner" on spots
  using (
    claimed_by = auth.uid() or created_by = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  )
  with check (
    claimed_by = auth.uid() or created_by = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

alter policy "redemptions_select_own" on redemptions
  using (
    user_id = auth.uid() or creator_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

alter policy "subscriptions_owner" on subscriptions
  using (business_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.is_admin))
  with check (business_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.is_admin));
