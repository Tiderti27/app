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

# Mobile App (Expo)
npm run mobile

# Laden-Dashboard (Next.js)
npm run web

# Lokales Supabase-Backend (benoetigt Supabase CLI)
supabase start
```

Beide Apps erwarten `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(Mobile) bzw. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Web)
als Umgebungsvariablen.

## Status

Aktuell: Repo-Grundgeruest gemaess `docs/spec.md` Abschnitt 15 (MVP). Naechste
Schritte: Kartenansicht mit echten Supabase-Daten, Auth-Flow, Community-Score-
Bewertung.
