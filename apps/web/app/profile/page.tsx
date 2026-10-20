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
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
            openingHours: spot.opening_hours ?? {},
          });
        }
        setLoading(false);
      });
  }, [session]);

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    event.target.value = "";
    if (!files || files.length === 0 || !spotId) return;

    setPhotoError(null);
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${spotId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("spot-photos").upload(path, file);
      if (uploadError) {
        setPhotoError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("spot-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    const updatedPhotos = [...photos, ...newUrls];
    const { error: updateError } = await supabase.from("spots").update({ photos: updatedPhotos }).eq("id", spotId);
    if (!updateError) setPhotos(updatedPhotos);
    else setPhotoError(updateError.message);

    setUploading(false);
  }

  async function handlePhotoRemove(url: string) {
    if (!spotId) return;
    const updatedPhotos = photos.filter((p) => p !== url);
    const { error: updateError } = await supabase.from("spots").update({ photos: updatedPhotos }).eq("id", spotId);
    if (!updateError) {
      setPhotos(updatedPhotos);
      const path = url.split("/spot-photos/")[1];
      if (path) await supabase.storage.from("spot-photos").remove([path]);
    }
  }

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
      <main className="page">
        <div className="card">Laden...</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div>
        <h1 className="page-title">{spotId ? "Profil bearbeiten" : "Profil anlegen"}</h1>
        <p className="page-subtitle">Diese Angaben sehen Nutzer:innen auf deinem Spot-Profil.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
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
          <span className="form-section-title">Fotos</span>
          {!spotId ? (
            <span className="form-section-hint">Speichere zuerst dein Profil, um Fotos hochzuladen.</span>
          ) : (
            <>
              {photos.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {photos.map((url) => (
                    <div key={url} style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10 }}
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(url)}
                        className="pill-button reject"
                        style={{ position: "absolute", top: 4, right: 4, padding: "2px 8px" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label>
                {uploading ? "Lädt hoch..." : "Fotos hinzufügen"}
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} />
              </label>
              {photoError && <span className="error-text">{photoError}</span>}
            </>
          )}
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
    </main>
  );
}
