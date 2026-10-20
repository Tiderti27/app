-- Storage-Bucket fuer Spot-Fotos (docs/spec.md Abschnitt 7.2 "Profil
-- bearbeiten: Fotos hochladen"). Oeffentlich lesbar, Upload nur fuer den
-- Laden, dem der jeweilige Spot gehoert, oder einen Admin.
-- Pfad-Konvention: <spot_id>/<dateiname>, damit die Policy pro Ordner
-- pruefen kann, wem der Spot gehoert.

insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict (id) do nothing;

create policy "spot_photos_public_read" on storage.objects
  for select using (bucket_id = 'spot-photos');

create policy "spot_photos_owner_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'spot-photos'
    and (
      exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
      or exists (
        select 1 from spots s
        where s.claimed_by = auth.uid()
          and (storage.foldername(name))[1] = s.id::text
      )
    )
  );

create policy "spot_photos_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'spot-photos'
    and (
      exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
      or exists (
        select 1 from spots s
        where s.claimed_by = auth.uid()
          and (storage.foldername(name))[1] = s.id::text
      )
    )
  );
