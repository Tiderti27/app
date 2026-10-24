# Spot

Spot sammelt virale Orte aus Social Media (TikTok, Instagram, YouTube) auf einer
interaktiven Karte, bewertet sie per Community-Score (Metacritic-Prinzip) und
verbindet Laeden mit Content Creatorn ueber ein Rabattcode-System.

Die vollstaendige Produkt- und technische Spezifikation steht in [`docs/spec.md`](docs/spec.md).

## Monorepo-Struktur

```
apps/
  mobile/   Nutzer- und Creator-App (React Native / Expo, TypeScript)
  web/      Laden-Dashboard (Next.js, TypeScript)
packages/
  shared/   Geteilte Typen und Konstanten (DB-Modelle, Kategorien, Score-Farben)
supabase/
  migrations/  SQL-Schema (PostgreSQL + PostGIS)
  config.toml  Lokale Supabase-CLI-Konfiguration
docs/
  spec.md   Vollstaendige Spezifikation
```

## Setup

```bash
npm install

# Eigenes Supabase-Projekt anlegen (supabase.com) und Migrationen anwenden,
# z.B. mit der Supabase CLI:
supabase link --project-ref <dein-projekt-ref>
supabase db push

# Env-Variablen setzen (Werte aus dem Supabase-Projekt: Settings -> API)
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.example apps/web/.env.local

# Mobile App (Expo)
npm run mobile

# Laden-Dashboard (Next.js)
npm run web
```

Beide Apps erwarten `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(Mobile) bzw. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Web)
als Umgebungsvariablen.

## Status

MVP gemaess `docs/spec.md` Abschnitt 15 ist umgesetzt:

- Nutzerkonto (Registrierung/Login) in Mobile-App und Laden-Dashboard
- Karte mit Standort, Umkreissuche (PostGIS) und Listenansicht (Score/Entfernung/Neueste)
- Kategoriefilter
- Spot-Detailseite mit Basisdaten, Community-Score und verknuepften Videos
- Community-Score bewerten ("War gut hier", Bayesian Average serverseitig)
- Merkliste (speichern/entfernen)
- Laden-Dashboard: Profil anlegen/bearbeiten inkl. Oeffnungszeiten

Offen (bewusst zurueckgestellt, siehe Abschnitt 15 "Zweite Ausbaustufe"):
Rabattcode-System, Creator-Profile, Laden-Statistiken, Stripe-Abos, Creator-Auszahlungen.

Bekannte Einschraenkung: Die Standortkoordinaten eines Spots werden im
Laden-Dashboard aktuell manuell eingegeben (kein Google-Places-Autocomplete),
siehe `docs/spec.md` Abschnitt 9.
