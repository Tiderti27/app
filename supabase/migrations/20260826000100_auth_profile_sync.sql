-- Legt bei jeder Registrierung (auth.users) automatisch das passende
-- public.users-Profil an. role und username kommen aus den Metadaten,
-- die beim signUp() mitgegeben werden (siehe apps/mobile/src/lib/auth-context.tsx
-- und apps/web/src/lib/auth-context.tsx).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, username, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'display_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'consumer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
