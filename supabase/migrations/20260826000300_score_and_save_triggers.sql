-- Community-Score als Bayesian Average (docs/spec.md Abschnitt 6) und
-- save_count immer aus den tatsaechlichen Zeilen neu berechnen, statt sie
-- clientseitig hochzuzaehlen (verhindert Drift durch Race Conditions).

create or replace function public.recompute_spot_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_spot_id uuid := coalesce(new.spot_id, old.spot_id);
  v_avg numeric;
  v_count integer;
  v_city text;
  c_avg numeric;
  m constant integer := 10; -- Mindestanzahl Stimmen fuer volle Gewichtung
begin
  select avg(score), count(*) into v_avg, v_count
  from ratings where spot_id = target_spot_id;

  select city into v_city from spots where id = target_spot_id;

  select avg(r.score) into c_avg
  from ratings r
  join spots s on s.id = r.spot_id
  where s.city = v_city;

  update spots
  set score = round(
        (coalesce(v_count, 0)::numeric / (coalesce(v_count, 0) + m))
          * coalesce(v_avg, 0)
        + (m::numeric / (coalesce(v_count, 0) + m))
          * coalesce(c_avg, coalesce(v_avg, 0)),
        1
      ),
      score_count = coalesce(v_count, 0)
  where id = target_spot_id;

  return null;
end;
$$;

create trigger ratings_recompute_score
  after insert or update or delete on ratings
  for each row execute function public.recompute_spot_score();

create or replace function public.recompute_spot_save_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_spot_id uuid := coalesce(new.spot_id, old.spot_id);
begin
  update spots
  set save_count = (select count(*) from saves where spot_id = target_spot_id)
  where id = target_spot_id;
  return null;
end;
$$;

create trigger saves_recompute_count
  after insert or delete on saves
  for each row execute function public.recompute_spot_save_count();
