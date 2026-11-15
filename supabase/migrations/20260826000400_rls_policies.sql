-- Row Level Security fuer alle Tabellen. Fuer die MVP-Faehigkeiten (Users,
-- Spots, Ratings, Saves, Videos) sind die Policies vollstaendig; die Tabellen
-- der zweiten Ausbaustufe (Promotions, Codes, Redemptions, Subscriptions,
-- Payouts) bekommen bereits restriktive Owner-Policies, damit sie sicher
-- sind, sobald die Features gebaut werden.

alter table users enable row level security;
create policy "users_select_authenticated" on users
  for select to authenticated using (true);
create policy "users_update_own" on users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

alter table spots enable row level security;
create policy "spots_select_authenticated" on spots
  for select to authenticated using (true);
create policy "spots_insert_own" on spots
  for insert to authenticated with check (created_by = auth.uid());
create policy "spots_update_owner" on spots
  for update to authenticated
  using (claimed_by = auth.uid() or created_by = auth.uid())
  with check (claimed_by = auth.uid() or created_by = auth.uid());

alter table ratings enable row level security;
create policy "ratings_select_authenticated" on ratings
  for select to authenticated using (true);
create policy "ratings_insert_own" on ratings
  for insert to authenticated with check (user_id = auth.uid());
create policy "ratings_update_own" on ratings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ratings_delete_own" on ratings
  for delete to authenticated using (user_id = auth.uid());

alter table saves enable row level security;
create policy "saves_select_own" on saves
  for select to authenticated using (user_id = auth.uid());
create policy "saves_insert_own" on saves
  for insert to authenticated with check (user_id = auth.uid());
create policy "saves_delete_own" on saves
  for delete to authenticated using (user_id = auth.uid());

alter table videos enable row level security;
create policy "videos_select_authenticated" on videos
  for select to authenticated using (true);
create policy "videos_insert_own" on videos
  for insert to authenticated with check (creator_id = auth.uid());
create policy "videos_delete_own" on videos
  for delete to authenticated using (creator_id = auth.uid());

alter table subscriptions enable row level security;
create policy "subscriptions_owner" on subscriptions
  for all to authenticated using (business_id = auth.uid()) with check (business_id = auth.uid());

alter table promotions enable row level security;
create policy "promotions_select_authenticated" on promotions
  for select to authenticated using (true);
create policy "promotions_owner_insert" on promotions
  for insert to authenticated with check (business_id = auth.uid());
create policy "promotions_owner_update" on promotions
  for update to authenticated using (business_id = auth.uid()) with check (business_id = auth.uid());

alter table promo_codes enable row level security;
create policy "promo_codes_select_authenticated" on promo_codes
  for select to authenticated using (true);
create policy "promo_codes_creator_insert" on promo_codes
  for insert to authenticated with check (creator_id = auth.uid());

alter table redemptions enable row level security;
create policy "redemptions_select_own" on redemptions
  for select to authenticated using (user_id = auth.uid() or creator_id = auth.uid());
create policy "redemptions_insert_own" on redemptions
  for insert to authenticated with check (user_id = auth.uid());

alter table creator_payouts enable row level security;
create policy "creator_payouts_select_own" on creator_payouts
  for select to authenticated using (creator_id = auth.uid());
