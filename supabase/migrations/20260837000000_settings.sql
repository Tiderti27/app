-- Grundlage fuer den neuen Einstellungsbereich in der Mobile-App:
-- Benachrichtigungs-Praeferenzen (fuer spaetere Push-Benachrichtigungen)
-- und ein Konto-Loeschungs-Antrag (echte Loeschung erfordert den
-- Service-Role-Key und wird daher manuell vom Admin im Supabase-Dashboard
-- ausgefuehrt; diese Tabelle haelt nur die Anfrage + den Bearbeitungsstatus
-- fest, analog zu creator_applications/spot_claims/reports).

alter table users add column notify_promotions boolean not null default true;
alter table users add column notify_saved_updates boolean not null default true;

grant update (username, display_name, avatar_url, notify_promotions, notify_saved_updates) on users to authenticated;

create table account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references users(id)
);

create index idx_account_deletion_requests_status on account_deletion_requests (status);

alter table account_deletion_requests enable row level security;

create policy "account_deletion_requests_select_own_or_admin" on account_deletion_requests
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

-- Insert laeuft ausschliesslich ueber die SECURITY DEFINER-Funktion unten,
-- analog zu apply_for_creator()/apply_for_spot_claim().

create or replace function public.request_account_deletion(p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;

  if exists (select 1 from account_deletion_requests where user_id = auth.uid() and status = 'pending') then
    raise exception 'Es liegt bereits eine Loeschanfrage vor';
  end if;

  insert into account_deletion_requests (user_id, reason) values (auth.uid(), nullif(trim(p_reason), ''));
end;
$$;

create or replace function public.admin_resolve_account_deletion(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from users where id = auth.uid() and is_admin) then
    raise exception 'Keine Admin-Berechtigung';
  end if;

  update account_deletion_requests
    set status = 'resolved', resolved_by = auth.uid(), resolved_at = now()
    where id = p_request_id and status = 'pending';
end;
$$;
