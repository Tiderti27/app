# Spot-App — Vollständige Spezifikation für Claude Code

---

## 1. Produktvision

Spot ist eine mobile App, die virale Orte aus Social Media (TikTok, Instagram, YouTube) auf einer interaktiven Karte sammelt, sie durch einen Community-Score (nach Metacritic-Vorbild) bewertbar macht und Läden erlaubt, über Content Creator Rabattaktionen auszuspielen.

**Kernproblem:** Man sieht auf TikTok ein Restaurant, einen Laden oder eine Aktion, denkt "da will ich hin" — und findet es zwei Wochen später nicht wieder. Die Videos sind flüchtig, die Info steht nirgends geordnet, und wenn man am Ort ist, weiß man nicht, ob der Hype echt ist oder bezahlt war.

**Zielgruppe:** Primär 16–30 Jahre, Social-Media-nativ, entscheidet spontan und ortsbezogen. Sekundär: lokale Läden und Gastronomie, die junge Kundschaft erreichen wollen.

**Alleinstellungsmerkmale:**
1. Community-Score nach Metacritic-Vorbild (nicht nur Sterne, sondern ein gewichteter Wert)
2. Breite über Essen hinaus: Läden, Aktionen, Events, Erlebnisse — alles, wo man hingehen kann
3. Creator-Laden-Verbindung im selben System mit Rabattcode-Mechanismus

**Motto:** "Landkarte, nicht Bühne" — keine eigene Videoplattform, keine Content-Konkurrenz zu TikTok. Die App liefert Ordnung, nicht Unterhaltung.

---

## 2. Die drei Rollen

### 2.1 Nutzer (Consumer)
- Öffnet die App, sieht Umkreis auf der Karte
- Filtert nach Kategorien und persönlichen Vorlieben
- Sieht zu jedem Ort: Community-Score, verknüpfte Videos, aktuelle Rabattaktionen
- Kann Orte speichern (Merkliste), bewerten ("War gut hier"), kommentieren
- Kann Creator-Rabattcodes eingeben, um QR-Codes zum Einlösen zu erhalten
- **Zahlt nie.**

### 2.2 Creator
- Verknüpft eigene Videos (TikTok, Instagram, YouTube) mit konkreten Orten in der App
- Baut ein Profil auf, das Empfehlungen dauerhaft sichtbar hält
- Bekommt von Läden personalisierte Rabattcodes (z.B. LEA10)
- Verdient **0,50 € fester Betrag pro eingelöstem Code** (nicht prozentual vom Kaufwert)
- Bewirbt den Code in seinen Videos — der Code ist der Schlüssel zur Aktion

### 2.3 Laden (Business)
- Übernimmt sein Profil auf der Plattform (Öffnungszeiten, Fotos, Beschreibung, Menü/Angebot)
- Startet Rabattaktionen und verknüpft diese mit Creatorn
- Sieht Statistiken: Profilaufrufe, Merkliste-Saves, Code-Einlösungen, welcher Creator am meisten bringt
- Scannt QR-Codes der Kunden an der Kasse
- **Verwaltet alles über eine Web-Oberfläche (kein eigener App-Download nötig)**

---

## 3. Architektur-Übersicht

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   Mobile App (Nutzer    │     │   Web-Dashboard         │
│   + Creator)            │     │   (Läden)               │
│   React Native / Expo   │     │   Next.js               │
│   iOS + Android         │     │   Responsive            │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │                               │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Backend / API       │
            │   Supabase            │
            │   (Auth, DB, Storage, │
            │    Realtime, Edge     │
            │    Functions)         │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   PostgreSQL + PostGIS│
            │   (Supabase hosted)   │
            └───────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
    Google Places   Stripe      TikTok Display
    API             (Abo-       API (nur mit
    (Basisdaten)    Zahlung)    Creator-Login)
```

### Tech-Stack
- **Mobile App:** React Native mit Expo (TypeScript) — beide Plattformen aus einer Codebase
- **Laden-Dashboard:** Next.js (TypeScript) — Web-App, kein App-Store nötig
- **Backend:** Supabase (PostgreSQL + PostGIS, Auth, Storage, Edge Functions, Realtime)
- **Zahlungen:** Stripe (Laden-Abos über Web-Dashboard, NICHT in der App — Apple-Gebühren umgehen)
- **Kartendaten:** Google Places API (Basisdaten: Name, Adresse, Koordinaten, Öffnungszeiten)
- **Karten-Darstellung:** React Native Maps (MapView) oder Mapbox
- **Sprache überall:** TypeScript

---

## 4. Datenbank-Schema (PostgreSQL + PostGIS)

### 4.1 Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'creator', 'business')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Spots (Orte)
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'food', 'shopping', 'experience', 'nightlife', 'beauty', 'culture'
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS für Umkreissuche
  google_place_id TEXT, -- Verknüpfung zu Google Places
  phone TEXT,
  website TEXT,
  opening_hours JSONB, -- { "mon": "09:00-18:00", "tue": "09:00-18:00", ... }
  photos TEXT[], -- Array von Bild-URLs
  
  -- Community Score
  score NUMERIC(4,1) DEFAULT 0, -- 0-100, wie Metacritic
  score_count INTEGER DEFAULT 0, -- Anzahl Bewertungen
  save_count INTEGER DEFAULT 0, -- Wie oft auf Merkliste
  
  -- Business-Verknüpfung
  claimed_by UUID REFERENCES users(id), -- Laden hat Profil übernommen
  is_claimed BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index für schnelle Umkreissuche
CREATE INDEX idx_spots_location ON spots USING GIST (location);
CREATE INDEX idx_spots_category ON spots (category);
CREATE INDEX idx_spots_city ON spots (city);
CREATE INDEX idx_spots_score ON spots (score DESC);
```

### 4.3 Ratings (Bewertungen)
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 100), -- Einzelbewertung
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(spot_id, user_id) -- Ein User, eine Bewertung pro Spot
);
```

### 4.4 Saves (Merkliste)
```sql
CREATE TABLE saves (
  user_id UUID REFERENCES users(id),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);
```

### 4.5 Videos (Creator-Inhalte)
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id),
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube')),
  video_url TEXT NOT NULL, -- Originallink zum Video
  thumbnail_url TEXT,
  title TEXT,
  is_cooperation BOOLEAN DEFAULT false, -- Bezahlte Kooperation? Muss gekennzeichnet werden
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.6 Business Subscriptions (Laden-Abos)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES users(id),
  tier TEXT NOT NULL CHECK (tier IN ('basis', 'aktiv', 'premium')),
  -- Basis: 19€/Monat, Aktiv: 39€/Monat, Premium: 69€/Monat
  stripe_subscription_id TEXT, -- Stripe-Referenz
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.7 Promotions (Rabattaktionen)
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  business_id UUID REFERENCES users(id),
  title TEXT NOT NULL, -- z.B. "10% auf alles"
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(5,2) NOT NULL, -- 10 (für 10%) oder 2.50 (für 2,50€)
  
  -- Grenzen (vom Laden selbst bestimmt)
  max_redemptions INTEGER, -- NULL = unbegrenzt
  current_redemptions INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ, -- NULL = unbefristet
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.8 Promo Codes (Creator-Codes)
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id),
  code TEXT NOT NULL, -- z.B. "LEA10" — öffentlicher Code, den Creator im Video nennt
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(code) -- Codes global einzigartig
);
```

### 4.9 Redemptions (Code-Einlösungen)
```sql
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES promo_codes(id),
  promotion_id UUID REFERENCES promotions(id),
  user_id UUID REFERENCES users(id),
  creator_id UUID REFERENCES users(id), -- Creator, der den Code besitzt
  spot_id UUID REFERENCES spots(id),
  
  -- Einmaliger QR-Code
  qr_token TEXT UNIQUE NOT NULL, -- Einmaliger Token für QR-Code
  qr_expires_at TIMESTAMPTZ NOT NULL, -- QR läuft ab (z.B. 15 Min oder Ladenschluss)
  fallback_code TEXT, -- Kurze Nummer zum Abtippen (falls kein QR-Scanner)
  
  status TEXT NOT NULL CHECK (status IN ('generated', 'redeemed', 'expired')),
  redeemed_at TIMESTAMPTZ,
  redeemed_by_staff TEXT, -- Wer hat gescannt (optional)
  
  -- Abrechnungs-Info
  creator_payout NUMERIC(5,2) DEFAULT 0.50, -- Fester Betrag an Creator
  platform_fee NUMERIC(5,2) DEFAULT 0.50, -- Fester Betrag an Plattform
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ein User kann pro Aktion nur einmal einlösen (pro Konto)
  UNIQUE(promotion_id, user_id)
);
```

### 4.10 Creator Payouts (Auszahlungen)
```sql
CREATE TABLE creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  amount NUMERIC(8,2) NOT NULL,
  redemption_count INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed')),
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Der Rabattcode-Ablauf (Kernmechanismus)

Dies ist der wichtigste Ablauf der App. Zwei Stufen:

### Stufe 1: Creator-Code (öffentlich, wiederverwendbar)
1. Laden erstellt eine Rabattaktion im Web-Dashboard (z.B. "10% auf alles, maximal 100 Einlösungen, gültig bis Ende des Monats")
2. Laden verknüpft die Aktion mit einem Creator (z.B. @lea.eats)
3. System erzeugt einen Code: `LEA10` — fest zugeordnet zu Lea und dieser Aktion
4. Lea nennt `LEA10` in ihrem TikTok-Video
5. In der App steht im Laden-Profil: **"Aktion aktiv — über Creator einlösbar"** (NICHT der Code selbst)

### Stufe 2: Persönlicher QR-Code (einmalig, verfällt)
6. Nutzer sieht im Laden-Profil, dass eine Aktion läuft
7. Nutzer tippt `LEA10` in das Code-Eingabefeld ein (er kennt ihn aus Leas Video)
8. App validiert den Code und erzeugt einen **einmaligen, persönlichen QR-Code** für diesen Nutzer
9. QR-Code hat eine **Gültigkeitsdauer von 15 Minuten** (oder bis Ladenschluss, je nachdem was früher ist)
10. QR-Code zeigt zusätzlich eine **kurze Fallback-Nummer** (z.B. "4827") zum Abtippen, falls der Laden keinen Scanner hat
11. Nutzer zeigt QR-Code an der Kasse vor
12. Laden scannt ihn mit seiner Laden-App / Web-Dashboard → Code ist verbraucht
13. System registriert: Einlösung über Lea → Lea bekommt 0,50 €, Plattform bekommt 0,50 €

### Warum dieser Zwei-Stufen-Ansatz:
- Der öffentliche Code (`LEA10`) hält Leas Video wertvoll — man muss es gesehen haben
- Der einmalige QR-Code verhindert Weitergabe und Mehrfachnutzung
- Der Laden braucht nur ein Handy zum Scannen, kein Kassensystem-Umbau
- Das System weiß nicht, was gekauft wurde (nicht nötig bei festem Betrag pro Einlösung)

### Sichtbarkeitsregel im Laden-Profil:
- Code (`LEA10`) wird **NICHT** offen angezeigt — sonst ist der Creator überflüssig
- Stattdessen: "🎁 Aktion aktiv — über Creator einlösbar" mit Link zu verknüpften Creatorn
- Wer den Code aus dem Video kennt, tippt ihn ein
- Wer ihn nicht kennt, sieht immerhin, dass es eine Aktion gibt, und kann beim Creator nachschauen

### Was der Laden steuern kann:
- Rabatthöhe (Prozent oder Festbetrag)
- Maximale Anzahl Einlösungen (NULL = unbegrenzt)
- Gültigkeitszeitraum (von–bis)
- Welche Creator verknüpft sind
- Aktion jederzeit pausieren oder beenden

---

## 6. Community-Score (Metacritic-Prinzip)

### Berechnung
- Jeder Nutzer kann pro Spot einmal bewerten (Skala 1–100)
- Der Score ist der gewichtete Durchschnitt aller Bewertungen
- **Gewichtung nach Stimmenzahl:** Ein Spot mit 5 Bewertungen wird Richtung Gesamtdurchschnitt gezogen (Bayesian Average), damit 5× Score 100 nicht über 400× Score 85 steht

### Formel (Bayesian Average):
```
weighted_score = (v / (v + m)) * R + (m / (v + m)) * C

v = Anzahl Bewertungen dieses Spots
m = Mindestanzahl Stimmen für volle Gewichtung (z.B. 10)
R = Durchschnitt der Bewertungen dieses Spots
C = Gesamtdurchschnitt aller Spots in der Stadt
```

### Vertrauensregeln:
- Score ist **unkaufbar** — kein Laden kann ihn beeinflussen, egal welches Abo
- Score ist **unlöschbar** — Läden können Bewertungen nicht entfernen
- Läden dürfen auf Bewertungen **antworten**, aber nichts entfernen
- Bezahlte Creator-Aktionen werden als **"Kooperation"** markiert
- Bezahlte Platzierungen (Hervorhebung) sind **immer gekennzeichnet** und nie in organische Sortierung gemischt

---

## 7. Screens / Ansichten

### 7.1 Mobile App (Nutzer + Creator)

#### Home / Karte
- Kartenansicht mit aktuellem Standort + Umkreis
- Pins mit Farbe/Größe nach Community-Score
- Kategoriefilter oben (Food, Shopping, Experience, Nightlife, Beauty, Culture)
- Suchleiste
- Toggle: Kartenansicht ↔ Listenansicht (sortiert nach Score, Entfernung oder Neueste)

#### Spot-Detail
- Spot-Name, Kategorie, Adresse, Öffnungszeiten
- Community-Score (groß, prominent) + Anzahl Bewertungen
- "War gut hier" Button (eigene Bewertung abgeben)
- Verknüpfte Creator-Videos (Thumbnails, klickbar → öffnet Originalvideo in TikTok/Instagram/YouTube)
- Rabatt-Bereich:
  - Wenn Aktion aktiv: "🎁 Aktion verfügbar — Code eingeben" mit Eingabefeld
  - Wenn Code eingegeben und gültig: Einmaliger QR-Code + Fallback-Nummer + Countdown (Ablaufzeit)
  - Wenn keine Aktion: Bereich wird nicht angezeigt
- Kommentare / Bewertungen anderer Nutzer
- Auf Merkliste speichern (Herz-Icon)

#### Merkliste
- Gespeicherte Spots als Liste mit Score und Entfernung
- Sortierbar / Filterbar

#### Profil (Nutzer)
- Eigene Bewertungen
- Gespeicherte Spots
- Eingelöste Rabatte (Historie)
- Einstellungen

#### Profil (Creator — erweitert)
- Alles wie Nutzer, plus:
- Verknüpfte Videos (welche Spots empfohlen)
- Einnahmen-Übersicht (eingelöste Codes, Summe, Auszahlungsstatus)
- Aktive Kooperationen mit Läden

### 7.2 Web-Dashboard (Läden)

#### Dashboard-Startseite
- Überblick: Profilaufrufe, Merkliste-Saves, aktive Aktionen, Einlösungen diese Woche
- Schnellaktionen: Neue Aktion starten, Profil bearbeiten

#### Profil bearbeiten
- Name, Beschreibung, Fotos hochladen
- Öffnungszeiten (Wochentage + Uhrzeiten)
- Kategorie, Adresse (vorausgefüllt von Google Places)
- Menü / Angebot (Freitext oder strukturiert)

#### Aktionen verwalten
- Neue Aktion erstellen:
  - Rabatthöhe (Prozent oder Festbetrag)
  - Maximale Einlösungen
  - Gültigkeitszeitraum
  - Creator auswählen / einladen
- Aktive Aktionen: Status, Fortschritt (X von Y eingelöst), pausieren/beenden
- Vergangene Aktionen: Auswertung pro Aktion

#### QR-Code Scanner
- Kamera öffnen → QR scannen → Bestätigung "Rabatt eingelöst ✓"
- Alternative: Fallback-Nummer manuell eingeben
- Übersicht der heutigen Einlösungen

#### Statistiken (Aktiv- und Premium-Abo)
- Profilaufrufe über Zeit
- Einlösungen pro Creator
- Welcher Creator bringt die meisten Kunden
- Merkliste-Saves über Zeit

#### Abo-Verwaltung
- Aktuelles Abo anzeigen
- Upgrade/Downgrade (Weiterleitung zu Stripe Checkout)
- Rechnungshistorie

---

## 8. Geschäftsmodell & Preise

### Nutzer: Immer kostenlos

### Laden-Abos (monatlich, über Stripe, via Web-Dashboard — NICHT In-App):

| Stufe | Preis | Features |
|---|---|---|
| **Basis** | 19 €/Monat | Profil, Karte, Basis-Statistiken, max. 2 Aktionen gleichzeitig |
| **Aktiv** | 39 €/Monat | + Unbegrenzte Aktionen, Creator kontaktieren, hervorgehobene Darstellung, Detail-Statistiken |
| **Premium** | 69 €/Monat | + Eigene Aktionsseite, Prioritäts-Support, monatlicher PDF-Report |

### Pro Einlösung (zusätzlich zum Abo):
- **0,50 € an Creator** (fester Betrag, nicht prozentual — verhindert Bevorzugung teurer Läden)
- **0,50 € an Plattform** (deine Marge)
- Wird monatlich mit dem Laden abgerechnet (nicht pro Transaktion)

### Wichtig:
- Abo-Zahlung über **Stripe auf der Webseite**, nicht in der App → umgeht Apple 30%-Gebühr
- Kein Geld fließt über die App → keine Zahlungsdienste-Regulierung
- Der Laden gibt den Rabatt direkt an der Kasse — die App ist nur der Vermittler

---

## 9. Datenquellen & Rechtliches

### Basisdaten (Name, Adresse, Koordinaten, Öffnungszeiten)
- **Google Places API** oder Foursquare als Fundament
- Wird nur für den Grundeintrag verwendet — das Produkt ist die Schicht darüber

### Videos
- **KEIN automatisches Scraping von TikTok** — verstößt gegen ToS
- Videos kommen in die App auf zwei Wegen:
  1. **Creator loggen sich ein** und verknüpfen ihre Videos selbst (TikTok Display API erfordert Creator-Login)
  2. **Nutzer reichen Videolinks ein** (wie bei allen vergleichbaren Apps)
- Das Geschäftsmodell löst das Rechtsproblem: Creator loggen sich ohnehin ein, weil sie an Rabattcodes verdienen

### Datenschutz
- Standortdaten nur mit Erlaubnis, nur für Umkreissuche
- DSGVO-konform (Supabase EU-Region wählen)
- Bewertungen pseudonym möglich
- Rechtsform, Datenschutzerklärung, Auftragsverarbeitung klären (→ Anwalt)

---

## 10. Design-Richtlinien

### Visuelles Konzept
- **Dunkles Theme** als Standard (passt zur Zielgruppe)
- **Violett** als Primärfarbe / Akzent
- **Gelb/Gold** für den Community-Score (hebt sich ab, signalisiert Wertigkeit)
- Karte als Herzstück — Pins werden größer/leuchtender bei höherem Score
- Moderne, verspielte UI — nicht klinisch wie Google Maps, nicht überladen wie TripAdvisor
- Inspiration: TikTok-artige Schnelligkeit, Tinder-artige Einfachheit der Interaktion

### Farbpalette (CSS Custom Properties)
```css
:root {
  --bg-primary: #0f0f14;
  --bg-secondary: #1a1a24;
  --bg-card: #22222e;
  --accent-primary: #8b5cf6;    /* Violett */
  --accent-secondary: #a78bfa;
  --score-color: #fbbf24;       /* Gold/Gelb für Score */
  --score-high: #22c55e;        /* Grün für Score > 80 */
  --score-mid: #fbbf24;         /* Gelb für Score 50-79 */
  --score-low: #ef4444;         /* Rot für Score < 50 */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: #334155;
}
```

### Typografie
- Saubere Sans-Serif (Inter, SF Pro, oder System-Font)
- Score-Zahl in Bold, größer als umgebender Text
- Kategorien als abgerundete Chips/Tags

---

## 11. Umkreissuche (PostGIS)

### Spots im Umkreis finden:
```sql
SELECT *, ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) AS distance
FROM spots
WHERE ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
ORDER BY distance;
```

### Spots nach Score im Umkreis:
```sql
SELECT *, ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) AS distance
FROM spots
WHERE ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
  AND category = :category  -- optional
ORDER BY score DESC, distance;
```

---

## 12. API-Endpunkte (Supabase Edge Functions)

### Auth
- `POST /auth/signup` — Registrierung (E-Mail + Passwort oder Social Login)
- `POST /auth/login` — Login
- `POST /auth/logout` — Logout

### Spots
- `GET /spots/nearby?lat=X&lng=Y&radius=Z&category=C` — Umkreissuche
- `GET /spots/:id` — Spot-Detail inkl. Score, Videos, aktive Aktionen
- `POST /spots` — Neuen Spot anlegen (Creator/Admin)
- `PUT /spots/:id` — Spot bearbeiten (Laden, der Profil übernommen hat)

### Ratings
- `POST /spots/:id/rate` — Bewertung abgeben (1-100)
- `GET /spots/:id/ratings` — Alle Bewertungen eines Spots

### Saves
- `POST /spots/:id/save` — Auf Merkliste
- `DELETE /spots/:id/save` — Von Merkliste entfernen
- `GET /me/saves` — Eigene Merkliste

### Videos
- `POST /spots/:id/videos` — Video verknüpfen (Creator)
- `GET /spots/:id/videos` — Videos eines Spots

### Promotions & Codes
- `POST /promotions` — Neue Aktion erstellen (Laden)
- `PUT /promotions/:id` — Aktion bearbeiten/pausieren (Laden)
- `POST /promotions/codes` — Creator-Code erstellen (Laden verknüpft Creator)
- `POST /redeem/validate` — Creator-Code eingeben → prüfen ob gültig
- `POST /redeem/generate-qr` — Einmaligen QR-Code erzeugen (nach Code-Validierung)
- `POST /redeem/scan` — QR-Code scannen / Fallback-Code eintippen (Laden)
- `GET /promotions/:id/stats` — Einlösungs-Statistiken (Laden)

### Creator
- `GET /me/earnings` — Einnahmen-Übersicht
- `GET /me/codes` — Eigene aktive Codes

### Business Dashboard
- `GET /business/dashboard` — Überblick (Views, Saves, Einlösungen)
- `GET /business/stats` — Detaillierte Statistiken
- `POST /business/subscription` — Abo starten (Redirect zu Stripe)

---

## 13. Missbrauchs-Prävention

### Was NICHT bekämpft werden muss:
- Nutzer erstellt Zweitkonto und löst Code nochmal ein → **Harmlos.** Laden macht trotzdem Gewinn, Creator hat jemanden gebracht. Das ist kein Missbrauch, das ist Geschäft.

### Was bekämpft werden muss:
- Laden tippt Codes für Stammkunden ein, die eh da sind → **Echter Missbrauch.** Codes werden eingelöst für eine Leistung, die der Creator nicht erbracht hat.
- **Gegenmaßnahmen:** Auffällige Muster in den Daten (z.B. 50 Einlösungen in 10 Minuten), QR-Codes laufen nach 15 Minuten ab, Laden setzt selbst Limits

### Technische Schutzmaßnahmen:
- Jeder QR-Code ist **einmalig** und hat ein **Ablaufdatum** (15 Minuten oder Ladenschluss)
- Ein Nutzer kann pro Aktion **nur einmal** einlösen (DB Constraint: UNIQUE promotion_id + user_id)
- Der Laden bestimmt **maximale Einlösungen** und **Gültigkeitszeitraum**
- QR-Code zeigt zusätzlich **Fallback-Nummer** (4-stellig) zum Abtippen
- Auffällige Muster werden in der Statistik sichtbar (z.B. alle Einlösungen vom selben Gerät)

---

## 14. Markteinstieg-Strategie

**NICHT überall gleichzeitig starten.** Eine Stadt, komplett.

### Phase 1: Karte füllen
- Basisdaten über Google Places laden
- 20–30 echte, gute Spots manuell pflegen (mit Fotos, Beschreibungen)
- App darf beim ersten Öffnen nicht leer wirken

### Phase 2: Creator gewinnen (5–10)
- Lokale Creator mit echtem Eigeninteresse ansprechen
- Argument: "Deine Empfehlungen bleiben sichtbar, statt im Feed zu versinken"
- Über deren Reichweite kommen die ersten Nutzer

### Phase 3: Nutzer aufbauen
- Organisch über Creator-Reichweite
- Ziel: 200+ aktive Nutzer in der Stadt

### Phase 4: Läden ansprechen
- Nicht mit Bitte, sondern mit Argument: "200 junge Leute haben dich gespeichert"
- Erste Läden kostenlos onboarden (Basisdaten stehen schon da, Profil übernehmen)
- Abo pitchen, wenn Laden den Wert sieht

### Phase 5: Nächste Stadt
- Selber Ablauf als Vorlage
- Erst wenn erste Stadt funktioniert

---

## 15. MVP — Was zuerst gebaut werden muss

### MVP (erste Version):
1. ✅ Karte mit Standort und Umkreissuche
2. ✅ Kategoriefilter
3. ✅ Spot-Detailseite (Basisdaten, Score, Videos)
4. ✅ Community-Score (bewerten + "War gut hier")
5. ✅ Merkliste (speichern)
6. ✅ Nutzerkonto (Registrierung, Login)
7. ✅ Einfaches Laden-Dashboard (Profil bearbeiten, Öffnungszeiten)

### Zweite Ausbaustufe:
8. Rabattcode-System (Creator-Code → QR-Code → Scan)
9. Creator-Profil mit verknüpften Videos
10. Laden-Statistiken
11. Abo-System (Stripe-Integration)
12. Creator-Auszahlungen

### Bewusst aufgeschoben:
- Personalisierte Empfehlungen / Algorithmus
- Freundesnetzwerk / Social Features
- Push-Benachrichtigungen ("Neuer Spot in deiner Nähe")
- Mehrere Städte gleichzeitig
- Eigene Kurzvideo-Plattform (**NIEMALS** — "Landkarte, nicht Bühne")

---

## 16. Offene Punkte (zu klären vor/während Entwicklung)

- Genaue Gewichtung des Community-Score (Bayesian Average Parameter m und C)
- Schutz gegen gefälschte Bewertungen (Rate Limiting, Verifizierung)
- Ab welcher Summe Creator ausgezahlt werden (Mindestauszahlung)
- Google Places API Kosten bei wachsender Nutzerzahl
- Rechtsform des Unternehmens
- DSGVO-Datenschutzerklärung und Auftragsverarbeitung (→ Anwalt)
- Apple App Store Review Guidelines (besonders Zahlungs-Thema)
- Creator-Onboarding-Flow (TikTok OAuth, Video-Verknüpfung)

---

*Erstellt August 2026. Dieses Dokument ist die vollständige Spezifikation der Spot-App und dient als Grundlage für die Entwicklung mit Claude Code.*
