-- Spot-Beanspruchungs-Anfragen: ein Business-Konto kann einen bereits
-- bestehenden, noch nicht vergebenen Spot (z.B. von einem Admin angelegt)
-- "beanspruchen", statt einen Duplikat-Eintrag zu erstellen. Ein Admin muss
-- die Anfrage freigeben, bevor claimed_by tatsaechlich gesetzt wird --
-- verhindert, dass sich jemand einfach den Laden eines anderen aneignet.

create table spot_claims (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_spot_claims_status on spot_claims (status);
create index idx_spot_claims_spot on spot_claims (spot_id);

alter table spot_claims enable row level security;

create policy "spot_claims_select_own_or_admin" on spot_claims
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

-- Insert/Update laufen ausschliesslich ueber die SECURITY DEFINER-Funktionen
-- unten, analog zu apply_for_creator()/admin_review_creator_application().

create or replace function public.apply_for_spot_claim(p_spot_id uuid, p_message text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_spot spots%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;

  select * into v_spot from spots where id = p_spot_id;
  if v_spot.id is null then
    raise exception 'Spot nicht gefunden';
  end if;
  if v_spot.is_claimed then
    raise exception 'Dieser Spot ist bereits vergeben';
  end if;

  if exists (select 1 from spot_claims where spot_id = p_spot_id and user_id = auth.uid() and status = 'pending') then
    raise exception 'Du hast diesen Spot bereits beansprucht';
  end if;

  insert into spot_claims (spot_id, user_id, message)
  values (p_spot_id, auth.uid(), nullif(trim(p_message), ''));
end;
$$;

create or replace function public.admin_review_spot_claim(p_claim_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim spot_claims%rowtype;
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin) then
    raise exception 'Keine Admin-Berechtigung';
  end if;

  select * into v_claim from spot_claims where id = p_claim_id;
  if v_claim.id is null then
    raise exception 'Anfrage nicht gefunden';
  end if;
  if v_claim.status <> 'pending' then
    raise exception 'Anfrage wurde bereits bearbeitet';
  end if;

  update spot_claims
    set status = case when p_approve then 'approved' else 'rejected' end,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_claim_id;

  if p_approve then
    update spots set claimed_by = v_claim.user_id, is_claimed = true where id = v_claim.spot_id;
  end if;
end;
$$;
