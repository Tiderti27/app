-- Admin soll Zugriff auf saemtliche Funktionen haben, nicht nur auf das
-- Bearbeiten bereits bestehender Datensaetze. Erweitert die INSERT-Policies
-- um is_admin, damit ein Admin auch neue Spots/Aktionen/Codes fuer ein
-- beliebiges Business anlegen kann.

alter policy "spots_insert_own" on spots
  with check (
    created_by = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

alter policy "promotions_owner_insert" on promotions
  with check (
    business_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

alter policy "promo_codes_business_insert" on promo_codes
  with check (
    exists (select 1 from promotions p where p.id = promo_codes.promotion_id and p.business_id = auth.uid())
    or exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );

-- Admin braucht ausserdem eine Moeglichkeit, Spots komplett zu loeschen
-- (z.B. fehlerhaft angelegte Testeintraege) -- bisher gibt es gar keine
-- Delete-Policy auf spots.
create policy "spots_delete_admin" on spots
  for delete to authenticated using (
    exists (select 1 from users u where u.id = auth.uid() and u.is_admin)
  );
