"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { PromotionCard } from "@/components/promotion-card";
import { usePromotions } from "@/hooks/use-promotions";
import type { DiscountType } from "@spot/shared";

function isCurrentlyActive(promo: { is_active: boolean; valid_until: string | null }): boolean {
  return promo.is_active && (!promo.valid_until || new Date(promo.valid_until) >= new Date());
}

export default function PromotionsPage() {
  return (
    <AuthGate>
      <PromotionsContent />
    </AuthGate>
  );
}

function PromotionsContent() {
  const { spotId, promotions, loading, createPromotion, setActive, linkCreator } = usePromotions();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const value = Number(discountValue);
    if (!title.trim() || Number.isNaN(value) || value <= 0) {
      setError("Bitte Titel und eine gültige Rabatthöhe angeben.");
      return;
    }

    setSubmitting(true);
    const createError = await createPromotion({
      title: title.trim(),
      description: description.trim(),
      discountType,
      discountValue: value,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
    });
    setSubmitting(false);

    if (createError) {
      setError(createError);
      return;
    }

    setTitle("");
    setDescription("");
    setDiscountValue("");
    setMaxRedemptions("");
    setValidUntil("");
  }

  const active = promotions.filter(isCurrentlyActive);
  const past = promotions.filter((p) => !isCurrentlyActive(p));

  if (loading) {
    return (
      <main className="page">
        <div className="card">Laden...</div>
      </main>
    );
  }

  if (!spotId) {
    return (
      <main className="page">
        <div>
          <h1 className="page-title">Aktionen</h1>
          <p className="page-subtitle">Rabattcodes über Creator ausspielen</p>
        </div>
        <div className="card empty-state">
          <p>Lege zuerst dein Laden-Profil an, bevor du Aktionen erstellst.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div>
        <h1 className="page-title">Aktionen</h1>
        <p className="page-subtitle">Rabattcodes über Creator ausspielen</p>
      </div>

      <div className="card form-section">
        <span className="form-section-title">Neue Aktion erstellen</span>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label>
            Titel
            <input required placeholder="z.B. 10% auf alles" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Beschreibung (optional)
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="form-row" style={{ gridTemplateColumns: "140px 1fr" }}>
            <label>
              Typ
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}>
                <option value="percent">Prozent</option>
                <option value="fixed">Festbetrag</option>
              </select>
            </label>
            <label>
              Rabatthöhe
              <input
                required
                type="number"
                step="any"
                placeholder={discountType === "percent" ? "10" : "2.50"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </label>
          </div>
          <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label>
              Max. Einlösungen (optional)
              <input
                type="number"
                min={1}
                placeholder="unbegrenzt"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
              />
            </label>
            <label>
              Gültig bis (optional)
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </label>
          </div>

          {error && <span className="error-text">{error}</span>}

          <button className="button-primary" type="submit" disabled={submitting} style={{ alignSelf: "flex-start", minWidth: 160 }}>
            {submitting ? "..." : "Aktion erstellen"}
          </button>
        </form>
      </div>

      <div className="card panel">
        <span className="panel-title">Aktive Aktionen</span>
        {active.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Aktion erstellt.</p>
        ) : (
          <div className="promo-list">
            {active.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onToggleActive={(isActive) => setActive(promo.id, isActive)}
                onLinkCreator={(username, code) => linkCreator(promo.id, username, code)}
              />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="card panel">
          <span className="panel-title">Vergangene Aktionen</span>
          <div className="promo-list">
            {past.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onToggleActive={(isActive) => setActive(promo.id, isActive)}
                onLinkCreator={(username, code) => linkCreator(promo.id, username, code)}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
