-- Kompletter Reset der Test-/Demo-Daten + Grundausstattung:
-- 4 feste Test-Accounts (Admin, Laden, 2 Nutzer) und 20 fiktive Spots rund
-- um Gaildorf. Gedacht fuer die aktuelle Entwicklungsphase -- loescht ALLE
-- bisherigen Accounts und Inhalte in diesem Supabase-Projekt.

-- 1) Alles leeren -----------------------------------------------------------

truncate table
  creator_payouts, redemptions, promo_codes, promotions, subscriptions,
  videos, saves, ratings, spot_views, creator_applications,
  spots, users
cascade;

delete from auth.users;

-- 2) Vier feste Accounts ------------------------------------------------------
-- Passwort fuer alle vier: Test1234!
-- Admin:    admin@spot-app.de
-- Laden:    laden@spot-app.de
-- Nutzer 1: nutzer1@spot-app.de
-- Nutzer 2: nutzer2@spot-app.de

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    'a1000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated',
    'admin@spot-app.de',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"admin","display_name":"Admin","role":"consumer"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated',
    'laden@spot-app.de',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"laden_tum","display_name":"Pizzeria Bella Vista","role":"business"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated',
    'nutzer1@spot-app.de',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"nutzer1","display_name":"Nutzer Eins","role":"consumer"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1000000-0000-4000-8000-000000000004',
    'authenticated', 'authenticated',
    'nutzer2@spot-app.de',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"nutzer2","display_name":"Nutzer Zwei","role":"consumer"}'::jsonb,
    now(), now(), '', '', '', ''
  );

-- public.users wird durch den Trigger on_auth_user_created automatisch befuellt.
update users set is_admin = true where id = 'a1000000-0000-4000-8000-000000000001';

-- 3) 20 fiktive Spots rund um Gaildorf (PLZ 74405) ---------------------------
-- Koordinaten sind bewusst gestreut um den Ortskern (49.0004, 9.7606),
-- reine Testdaten, keine echten Betriebe.

insert into spots (
  id, name, description, category, address, city, location,
  opening_hours, score, score_count, save_count, is_claimed, claimed_by, created_by
) values
  (gen_random_uuid(), 'Café Lindenhof', 'Gemütliches Café mit hausgemachtem Kuchen.', 'food', 'Hauptstraße 12', 'Gaildorf', st_setsrid(st_makepoint(9.7598, 49.0021), 4326)::geography, '{"mon":"08:00-18:00","tue":"08:00-18:00","wed":"08:00-18:00","thu":"08:00-18:00","fri":"08:00-18:00","sat":"09:00-16:00"}'::jsonb, 88, 24, 12, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Pizzeria Bella Vista', 'Italienische Küche mit Holzofen-Pizza.', 'food', 'Marktplatz 3', 'Gaildorf', st_setsrid(st_makepoint(9.7611, 49.0002), 4326)::geography, '{"mon":"11:00-22:00","tue":"11:00-22:00","wed":"11:00-22:00","thu":"11:00-22:00","fri":"11:00-23:00","sat":"11:00-23:00","sun":"12:00-22:00"}'::jsonb, 95, 1, 3, true, 'a1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Burgerschmiede Gaildorf', 'Handgemachte Burger und Craft-Limonaden.', 'food', 'Bahnhofstraße 7', 'Gaildorf', st_setsrid(st_makepoint(9.7585, 49.0034), 4326)::geography, '{"mon":"11:30-21:00","tue":"11:30-21:00","wed":"11:30-21:00","thu":"11:30-21:00","fri":"11:30-22:00","sat":"11:30-22:00"}'::jsonb, 1, 1, 5, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Eiscafé Dolomiti', 'Italienisches Eis in über 20 Sorten.', 'food', 'Schlossstraße 5', 'Gaildorf', st_setsrid(st_makepoint(9.7620, 49.0012), 4326)::geography, '{"mon":"10:00-20:00","tue":"10:00-20:00","wed":"10:00-20:00","thu":"10:00-20:00","fri":"10:00-21:00","sat":"10:00-21:00","sun":"11:00-20:00"}'::jsonb, 91, 33, 19, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Mode Boutique Fein & Fesch', 'Kuratierte Damen- und Herrenmode.', 'shopping', 'Hauptstraße 22', 'Gaildorf', st_setsrid(st_makepoint(9.7593, 49.0028), 4326)::geography, '{"mon":"09:30-18:30","tue":"09:30-18:30","wed":"09:30-18:30","thu":"09:30-18:30","fri":"09:30-18:30","sat":"09:00-14:00"}'::jsonb, 76, 15, 7, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Buchhandlung Seitenweise', 'Inhabergeführte Buchhandlung mit Café-Ecke.', 'shopping', 'Kirchplatz 2', 'Gaildorf', st_setsrid(st_makepoint(9.7633, 49.0017), 4326)::geography, '{"mon":"09:00-18:00","tue":"09:00-18:00","wed":"09:00-18:00","thu":"09:00-18:00","fri":"09:00-18:00","sat":"09:00-13:00"}'::jsonb, 83, 20, 14, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Sport Aktiv Gaildorf', 'Sportausrüstung und Outdoor-Bekleidung.', 'shopping', 'Industriestraße 9', 'Gaildorf', st_setsrid(st_makepoint(9.7560, 48.9988), 4326)::geography, '{"mon":"09:00-19:00","tue":"09:00-19:00","wed":"09:00-19:00","thu":"09:00-19:00","fri":"09:00-19:00","sat":"09:00-16:00"}'::jsonb, 68, 11, 4, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Feinkost Schwarzwald', 'Regionale Spezialitäten und Weine.', 'shopping', 'Marktplatz 11', 'Gaildorf', st_setsrid(st_makepoint(9.7617, 49.0006), 4326)::geography, '{"mon":"09:00-18:00","tue":"09:00-18:00","wed":"09:00-18:00","thu":"09:00-18:00","fri":"09:00-18:00","sat":"09:00-14:00"}'::jsonb, 79, 9, 6, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Kletterpark Limpurger Berge', 'Hochseilgarten mit 8 Parcours für alle Level.', 'experience', 'Waldstraße 1', 'Gaildorf', st_setsrid(st_makepoint(9.7489, 49.0061), 4326)::geography, '{"wed":"13:00-19:00","thu":"13:00-19:00","fri":"13:00-19:00","sat":"10:00-19:00","sun":"10:00-19:00"}'::jsonb, 97, 48, 36, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Escape Room Rätselhaus', 'Drei Escape-Room-Szenarien für Gruppen bis 6.', 'experience', 'Hintere Gasse 4', 'Gaildorf', st_setsrid(st_makepoint(9.7645, 49.0024), 4326)::geography, '{"tue":"14:00-22:00","wed":"14:00-22:00","thu":"14:00-22:00","fri":"14:00-23:00","sat":"11:00-23:00","sun":"11:00-20:00"}'::jsonb, 90, 27, 21, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Bowling Center Kocherblick', 'Acht Bahnen, Snackbar und Lounge.', 'experience', 'Bahnhofstraße 20', 'Gaildorf', st_setsrid(st_makepoint(9.7571, 49.0041), 4326)::geography, '{"mon":"16:00-23:00","tue":"16:00-23:00","wed":"16:00-23:00","thu":"16:00-23:00","fri":"16:00-00:00","sat":"11:00-00:00","sun":"11:00-22:00"}'::jsonb, 62, 14, 8, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Schwimmbad Vital Gaildorf', 'Freibad mit Rutsche und Sprungturm.', 'experience', 'Badstraße 6', 'Gaildorf', st_setsrid(st_makepoint(9.7534, 49.0003), 4326)::geography, '{"mon":"09:00-19:00","tue":"09:00-19:00","wed":"09:00-19:00","thu":"09:00-19:00","fri":"09:00-19:00","sat":"09:00-20:00","sun":"09:00-20:00"}'::jsonb, 84, 31, 17, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Bar Kocherkante', 'Cocktailbar direkt am Kocherufer.', 'nightlife', 'Marktplatz 8', 'Gaildorf', st_setsrid(st_makepoint(9.7625, 48.9998), 4326)::geography, '{"wed":"18:00-01:00","thu":"18:00-01:00","fri":"18:00-02:00","sat":"18:00-02:00"}'::jsonb, 1, 1, 2, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Club Nachtfalke', 'Tanzclub mit wechselnden DJ-Lineups.', 'nightlife', 'Industriestraße 15', 'Gaildorf', st_setsrid(st_makepoint(9.7549, 49.0052), 4326)::geography, '{"fri":"22:00-04:00","sat":"22:00-04:00"}'::jsonb, 73, 19, 10, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Weinstube Alte Kelter', 'Historisches Gewölbe, regionale Weine.', 'nightlife', 'Schlossstraße 18', 'Gaildorf', st_setsrid(st_makepoint(9.7604, 49.0033), 4326)::geography, '{"tue":"17:00-23:00","wed":"17:00-23:00","thu":"17:00-23:00","fri":"17:00-00:00","sat":"17:00-00:00"}'::jsonb, 86, 22, 15, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Nagelstudio Glanz & Glamour', 'Maniküre, Pediküre und Nail Art.', 'beauty', 'Hauptstraße 30', 'Gaildorf', st_setsrid(st_makepoint(9.7579, 49.0015), 4326)::geography, '{"tue":"09:00-18:00","wed":"09:00-18:00","thu":"09:00-18:00","fri":"09:00-18:00","sat":"09:00-14:00"}'::jsonb, 80, 17, 9, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Friseur Haarmonie', 'Haarschnitt, Farbe und Styling.', 'beauty', 'Kirchplatz 6', 'Gaildorf', st_setsrid(st_makepoint(9.7641, 49.0009), 4326)::geography, '{"tue":"08:30-18:00","wed":"08:30-18:00","thu":"08:30-18:00","fri":"08:30-18:00","sat":"08:00-13:00"}'::jsonb, 71, 13, 6, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Beauty Lounge Luna', 'Kosmetikstudio mit Wellness-Anwendungen.', 'beauty', 'Gartenweg 3', 'Gaildorf', st_setsrid(st_makepoint(9.7512, 49.0044), 4326)::geography, '{"mon":"10:00-19:00","tue":"10:00-19:00","wed":"10:00-19:00","thu":"10:00-19:00","fri":"10:00-19:00"}'::jsonb, 93, 29, 24, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Galerie Kocherlicht', 'Wechselausstellungen regionaler Künstler.', 'culture', 'Schlossplatz 1', 'Gaildorf', st_setsrid(st_makepoint(9.7616, 49.0029), 4326)::geography, '{"wed":"14:00-18:00","thu":"14:00-18:00","fri":"14:00-18:00","sat":"11:00-17:00","sun":"11:00-17:00"}'::jsonb, 77, 10, 5, false, null, 'a1000000-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Kunstatelier Farbklang', 'Offenes Atelier mit Mal- und Töpferkursen.', 'culture', 'Mühlweg 9', 'Gaildorf', st_setsrid(st_makepoint(9.7557, 49.0007), 4326)::geography, '{"tue":"10:00-17:00","wed":"10:00-17:00","thu":"10:00-17:00","fri":"10:00-17:00","sat":"10:00-14:00"}'::jsonb, 65, 8, 3, false, null, 'a1000000-0000-4000-8000-000000000001')
;

-- 4) Ein paar erste Aktivitaeten fuer die beiden Nutzer-Accounts -------------
-- (Merkliste + eine echte Bewertung pro Nutzer -- loest die normalen
-- Trigger aus, der jeweilige Spot-Score wird dadurch aus dieser einen
-- Bewertung neu berechnet statt des oben gesetzten Platzhalterwerts.)

insert into saves (user_id, spot_id)
select 'a1000000-0000-4000-8000-000000000003'::uuid, id from spots where name = 'Café Lindenhof'
union all
select 'a1000000-0000-4000-8000-000000000003'::uuid, id from spots where name = 'Mode Boutique Fein & Fesch'
union all
select 'a1000000-0000-4000-8000-000000000003'::uuid, id from spots where name = 'Kletterpark Limpurger Berge'
union all
select 'a1000000-0000-4000-8000-000000000004'::uuid, id from spots where name = 'Burgerschmiede Gaildorf'
union all
select 'a1000000-0000-4000-8000-000000000004'::uuid, id from spots where name = 'Bar Kocherkante'
union all
select 'a1000000-0000-4000-8000-000000000004'::uuid, id from spots where name = 'Galerie Kocherlicht';

insert into ratings (spot_id, user_id, score)
select id, 'a1000000-0000-4000-8000-000000000003'::uuid, 90 from spots where name = 'Burgerschmiede Gaildorf';

insert into ratings (spot_id, user_id, score)
select id, 'a1000000-0000-4000-8000-000000000004'::uuid, 75 from spots where name = 'Bar Kocherkante';
