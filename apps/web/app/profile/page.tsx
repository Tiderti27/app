"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { SPOT_CATEGORIES, type OpeningHours, type Spot, type SpotCategory } from "@spot/shared";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
          setForm({
            name: spot.name,
            description: spot.description ?? "",
            category: spot.category,
            address: spot.address,
            city: spot.city,
            latitude: String(spot.latitude),
            longitude: String(spot.longitude),
            openingHours: spot.opening_hours ?? {},
          });
        }
        setLoading(false);
      });
  }, [session]);

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
      <main className="grid">
        <div className="card">Laden...</div>
      </main>
    );
  }

  return (
    <main className="grid">
      <form className="card form" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <h1 style={{ margin: 0 }}>{spotId ? "Profil bearbeiten" : "Profil anlegen"}</h1>

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
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Bis zur Google-Places-Anbindung (docs/spec.md Abschnitt 9) manuell eintragen, z.B. per Rechtsklick
          auf Google Maps.
        </span>

        <fieldset style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
          <legend style={{ padding: "0 6px", color: "var(--text-secondary)", fontSize: 13 }}>Oeffnungszeiten</legend>
          {WEEKDAYS.map((day) => (
            <div className="form-row" key={day.key} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{day.label}</span>
              <input
                placeholder="z.B. 09:00-18:00"
                value={form.openingHours[day.key] ?? ""}
                onChange={(e) => updateHours(day.key, e.target.value)}
              />
            </div>
          ))}
        </fieldset>

        {error && <span className="error-text">{error}</span>}
        {saved && <span className="success-text">Gespeichert.</span>}

        <button className="button-primary" type="submit" disabled={saving}>
          {saving ? "..." : "Speichern"}
        </button>
      </form>
    </main>
  );
}
