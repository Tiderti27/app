"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { SPOT_CATEGORIES, type OpeningHours, type Spot, type SpotCategory } from "@spot/shared";
import { PhotoManager } from "@/components/photo-manager";
import { MobileAppPreview } from "@/components/mobile-app-preview";
import { SpotClaimSearch } from "@/components/spot-claim-search";

const WEEKDAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: "mon", label: "Montag" },
  { key: "tue", label: "Dienstag" },
  { key: "wed", label: "Mittwoch" },
  { key: "thu", label: "Donnerstag" },
  { key: "fri", label: "Freitag" },
  { key: "sat", label: "Samstag" },
  { key: "sun", label: "Sonntag" },
];

interface FormState {
  name: string;
  description: string;
  category: SpotCategory;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  phone: string;
  website: string;
  openingHours: OpeningHours;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: "food",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  phone: "",
  website: "",
  openingHours: {},
};

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileForm />
    </AuthGate>
  );
}

function ProfileForm() {
  const { session } = useAuth();
  const [spotId, setSpotId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pendingClaimSpotName, setPendingClaimSpotName] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!session) return;

    supabase
      .from("spots_view")
      .select("*")
      .eq("claimed_by", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        const spot = data as Spot | null;
        if (spot) {
          setSpotId(spot.id);
          setPhotos(spot.photos ?? []);
          setForm({
            name: spot.name,
            description: spot.description ?? "",
            category: spot.category,
            address: spot.address,
            city: spot.city,
            latitude: String(spot.latitude),
            longitude: String(spot.longitude),
            phone: spot.phone ?? "",
            website: spot.website ?? "",
            openingHours: spot.opening_hours ?? {},
          });
        }
        setLoading(false);
      });
  }, [session]);

  useEffect(() => {
    if (!session || spotId) return;

    supabase
      .from("spot_claims")
      .select("*, spots(name)")
      .eq("user_id", session.user.id)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }) => {
        const row = data as (Record<string, unknown> & { spots: { name: string } | null }) | null;
        if (row) setPendingClaimSpotName(row.spots?.name ?? "deinem Spot");
      });
  }, [session, spotId]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHours(day: keyof OpeningHours, value: string) {
    setForm((prev) => ({ ...prev, openingHours: { ...prev.openingHours, [day]: value } }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;

    setError(null);
    setSaved(false);

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Breiten- und Laengengrad muessen Zahlen sein.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category,
      address: form.address,
      city: form.city,
      phone: form.phone || null,
      website: form.website || null,
      opening_hours: form.openingHours,
      location: `POINT(${lng} ${lat})`,
    };

    const { error: submitError } = spotId
      ? await supabase.from("spots").update(payload).eq("id", spotId)
      : await supabase
          .from("spots")
          .insert({ ...payload, claimed_by: session.user.id, created_by: session.user.id, is_claimed: true })
          .select("id")
          .single()
          .then(({ data, error: insertError }) => {
            if (data) setSpotId(data.id as string);
            return { error: insertError };
          });

    setSaving(false);

    if (submitError) {
      setError(submitError.message);
    } else {
      setSaved(true);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">Laden...</div>
      </main>
    );
  }

  if (!spotId && pendingClaimSpotName) {
    return (
      <main className="page">
        <div>
          <h1 className="page-title">Anfrage wartet auf Freigabe</h1>
          <p className="page-subtitle">
            Deine Anfrage für <strong>{pendingClaimSpotName}</strong> wird von einem Admin geprüft. Das kann etwas
            dauern — schau später nochmal vorbei.
          </p>
        </div>
      </main>
    );
  }

  if (!spotId && !showCreateForm) {
    return (
      <main className="page">
        <div>
          <h1 className="page-title">Profil anlegen</h1>
          <p className="page-subtitle">Diese Angaben sehen Nutzer:innen auf deinem Spot-Profil.</p>
        </div>
        <SpotClaimSearch
          onClaimed={() => setPendingClaimSpotName("deinem Spot")}
          onCreateNew={() => setShowCreateForm(true)}
        />
      </main>
    );
  }

  return (
    <main className="page">
      <div>
        <h1 className="page-title">{spotId ? "Profil bearbeiten" : "Profil anlegen"}</h1>
        <p className="page-subtitle">Diese Angaben sehen Nutzer:innen auf deinem Spot-Profil.</p>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560, flex: "1 1 420px" }}>
          <div className="card form-section">
            <span className="form-section-title">Grunddaten</span>

            <label>
              Name
              <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </label>

            <label>
              Beschreibung
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </label>

            <label>
              Kategorie
              <select value={form.category} onChange={(e) => updateField("category", e.target.value as SpotCategory)}>
                {SPOT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <label>
                Telefon (optional)
                <input
                  type="tel"
                  placeholder="z.B. 07971 123456"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </label>
              <label>
                Website (optional)
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="card form-section">
            <span className="form-section-title">Fotos</span>
            <PhotoManager spotId={spotId} photos={photos} onPhotosChange={setPhotos} />
          </div>

          <div className="card form-section">
            <span className="form-section-title">Standort</span>

            <label>
              Adresse
              <input required value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </label>

            <label>
              Stadt
              <input required value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </label>

            <div className="form-row">
              <label>
                Breitengrad
                <input
                  required
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                />
              </label>
              <label>
                Laengengrad
                <input
                  required
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                />
              </label>
            </div>
            <span className="form-section-hint">
              Bis zur Google-Places-Anbindung (docs/spec.md Abschnitt 9) manuell eintragen, z.B. per Rechtsklick auf
              Google Maps.
            </span>
          </div>

          <div className="card form-section">
            <span className="form-section-title">Öffnungszeiten</span>
            <div className="hours-grid">
              {WEEKDAYS.map((day) => (
                <div className="hours-row" key={day.key}>
                  <span>{day.label}</span>
                  <input
                    placeholder="z.B. 09:00-18:00"
                    value={form.openingHours[day.key] ?? ""}
                    onChange={(e) => updateHours(day.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <span className="error-text">{error}</span>}
          {saved && <span className="success-text">Gespeichert.</span>}

          <button className="button-primary" type="submit" disabled={saving} style={{ alignSelf: "flex-start", minWidth: 140 }}>
            {saving ? "..." : "Speichern"}
          </button>
        </form>

        <div style={{ position: "sticky", top: 20, flex: "0 0 auto" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Vorschau in der App
          </p>
          <MobileAppPreview
            name={form.name}
            category={form.category}
            address={form.address}
            city={form.city}
            photos={photos}
            openingHours={form.openingHours}
            phone={form.phone}
            website={form.website}
          />
        </div>
      </div>
    </main>
  );
}
