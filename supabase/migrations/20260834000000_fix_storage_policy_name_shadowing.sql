-- Bugfix: In den spot-photos-Storage-Policies war die Spalte "name"
-- unqualifiziert. Da die EXISTS-Subquery "from spots s" selbst eine Spalte
-- "name" besitzt (der Laden-Name), hat Postgres das unqualifizierte "name"
-- IN DER SUBQUERY gegen spots.name aufgeloest statt gegen das eigentlich
-- gemeinte storage.objects.name (den hochgeladenen Datei-Pfad). Die
-- Ordner-Pruefung hat dadurch nie den echten Pfad gesehen und die Policy
-- ist fuer jeden echten Upload fehlgeschlagen. Fix: "objects.name" explizit
-- qualifizieren (das von Supabase selbst empfohlene Muster).

drop policy if exists "spot_photos_owner_insert" on storage.objects;
create policy "spot_photos_owner_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'spot-photos'
    and (
      exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
      or exists (
        select 1 from spots s
        where s.claimed_by = auth.uid()
          and (storage.foldername(objects.name))[1] = s.id::text
      )
    )
  );

drop policy if exists "spot_photos_owner_delete" on storage.objects;
create policy "spot_photos_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'spot-photos'
    and (
      exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
      or exists (
        select 1 from spots s
        where s.claimed_by = auth.uid()
          and (storage.foldername(objects.name))[1] = s.id::text
      )
    )
  );
