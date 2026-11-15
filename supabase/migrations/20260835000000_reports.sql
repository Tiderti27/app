-- Meldesystem fuer unangemessene Inhalte (Spots, Bewertungen, Fotos).
-- Jede Meldung bezieht sich immer auf einen Spot; bei Bewertungen/Fotos
-- zusaetzlich auf die konkrete Bewertung bzw. Foto-URL (Fotos sind kein
-- eigenes Table, sondern spots.photos[] -- daher per URL statt ID).

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references users(id) not null,
  target_type text not null check (target_type in ('spot', 'rating', 'photo')),
  spot_id uuid references spots(id) on delete cascade not null,
  rating_id uuid references ratings(id) on delete cascade,
  photo_url text,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references users(id)
);

create index idx_reports_status on reports (status);
create index idx_reports_spot on reports (spot_id);

alter table reports enable row level security;

create policy "reports_insert_own" on reports
  for insert to authenticated with check (reporter_id = auth.uid());

create policy "reports_select_own_or_admin" on reports
  for select to authenticated using (
    reporter_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

create policy "reports_update_admin" on reports
  for update to authenticated
  using (exists (select 1 from users u where u.id = auth.uid() and u.is_admin))
  with check (exists (select 1 from users u where u.id = auth.uid() and u.is_admin));
