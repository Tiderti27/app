"use client";

import { useState } from "react";
import { SPOT_CATEGORIES, type Spot, type SpotCategory, type User } from "@spot/shared";
import type { SpotFormInput } from "@/hooks/use-admin-spots";

const WEEKDAYS: { key: keyof SpotFormInput["openingHours"]; label: string }[] = [
  { key: "mon", label: "Montag" },
  { key: "tue", label: "Dienstag" },
  { key: "wed", label: "Mittwoch" },
  { key: "thu", label: "Donnerstag" },
  { key: "fri", label: "Freitag" },
  { key: "sat", label: "Samstag" },
  { key: "sun", label: "Sonntag" },
];

function toFormInput(spot: Spot | null): SpotFormInput {
  if (!spot) {
    return {
      name: "",
      description: "",
      category: "food",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      openingHours: {},
      claimedBy: null,
    };
  }
  return {
    name: spot.name,
    description: spot.description ?? "",
    category: spot.category,
    address: spot.address,
    city: spot.city,
    latitude: String(spot.latitude),
    longitude: String(spot.longitude),
    openingHours: spot.opening_hours ?? {},
    claimedBy: spot.claimed_by,
  };
}

export function AdminSpotEditor({
  spot,
  businesses,
  onSave,
  onCancel,
}: {
  spot: Spot | null;
  businesses: User[];
  onSave: (input: SpotFormInput) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SpotFormInput>(toFormInput(spot));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof SpotFormInput>(key: K, value: SpotFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHours(day: string, value: string) {
    setForm((prev) => ({ ...prev, openingHours: { ...prev.openingHours, [day]: value } }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const saveError = await onSave(form);
    setSaving(false);
    if (saveError) setError(saveError);
    else onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="card form-section" style={{ maxWidth: "none" }}>
      <span className="form-section-title">{spot ? `Spot bearbeiten: ${spot.name}` : "Neuen Spot anlegen"}</span>

      <label>
        Name
        <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} />
      </label>

      <label>
        Beschreibung
        <textarea rows={2} value={form.description} onChange={(e) => updateField("description", e.target.value)} />
      </label>

      <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
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
          Zugeordnetes Business
          <select
            value={form.claimedBy ?? ""}
            onChange={(e) => updateField("claimedBy", e.target.value || null)}
          >
            <option value="">Nicht vergeben</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                @{b.username}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Adresse
        <input required value={form.address} onChange={(e) => updateField("address", e.target.value)} />
      </label>
      <label>
        Stadt
        <input required value={form.city} onChange={(e) => updateField("city", e.target.value)} />
      </label>

      <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <label>
          Breitengrad
          <input required type="number" step="any" value={form.latitude} onChange={(e) => updateField("latitude", e.target.value)} />
        </label>
        <label>
          Längengrad
          <input required type="number" step="any" value={form.longitude} onChange={(e) => updateField("longitude", e.target.value)} />
        </label>
      </div>

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

      {error && <span className="error-text">{error}</span>}

      <div style={{ display: "flex", gap: 10 }}>
        <button className="button-primary" type="submit" disabled={saving} style={{ minWidth: 120 }}>
          {saving ? "..." : "Speichern"}
        </button>
        <button type="button" className="pill-button" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}
