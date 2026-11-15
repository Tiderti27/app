"use client";

import { useState } from "react";
import type { PromotionWithCodes } from "@/hooks/use-promotions";

function formatDiscount(type: "percent" | "fixed", value: number): string {
  return type === "percent" ? `${value}%` : `${value.toFixed(2)} €`;
}

export function PromotionCard({
  promotion,
  onToggleActive,
  onLinkCreator,
}: {
  promotion: PromotionWithCodes;
  onToggleActive: (isActive: boolean) => void;
  onLinkCreator: (username: string, code: string) => Promise<string | null>;
}) {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const progressPercent =
    promotion.max_redemptions && promotion.max_redemptions > 0
      ? Math.min(100, (promotion.current_redemptions / promotion.max_redemptions) * 100)
      : null;

  async function handleLink() {
    setError(null);
    if (!username.trim() || !code.trim()) {
      setError("Bitte Nutzername und Code angeben.");
      return;
    }
    setSubmitting(true);
    const linkError = await onLinkCreator(username, code);
    setSubmitting(false);
    if (linkError) {
      setError(linkError);
      return;
    }
    setUsername("");
    setCode("");
  }

  return (
    <div className="promo-card">
      <div className="promo-card-header">
        <div>
          <div className="promo-card-title">{promotion.title}</div>
          <div className="promo-card-meta">
            {formatDiscount(promotion.discount_type, promotion.discount_value)} ·{" "}
            {promotion.max_redemptions
              ? `${promotion.current_redemptions} von ${promotion.max_redemptions} eingelöst`
              : `${promotion.current_redemptions} eingelöst · unbegrenzt`}
            {promotion.valid_until && ` · gültig bis ${new Date(promotion.valid_until).toLocaleDateString("de-DE")}`}
          </div>
        </div>
        <span className={`promo-card-status ${promotion.is_active ? "active" : "inactive"}`}>
          {promotion.is_active ? "Aktiv" : "Beendet"}
        </span>
      </div>

      {progressPercent !== null && (
        <div className="promotion-progress-track" style={{ width: "100%" }}>
          <div className="promotion-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      )}

      <div className="promo-codes">
        {promotion.codes.length === 0 && (
          <span className="promo-card-meta" style={{ marginTop: 0 }}>
            Noch kein Creator verknüpft.
          </span>
        )}
        {promotion.codes.map((c) => (
          <span key={c.id} className="promo-code-pill">
            @{c.creator_username} · {c.code}
          </span>
        ))}
      </div>

      {promotion.is_active && (
        <div className="promo-link-form">
          <input placeholder="Creator-Nutzername" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Code, z.B. LEA10" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="button" onClick={handleLink} disabled={submitting}>
            {submitting ? "..." : "Verknüpfen"}
          </button>
        </div>
      )}
      {error && <span className="error-text">{error}</span>}

      <div className="promo-card-actions">
        <button type="button" onClick={() => onToggleActive(!promotion.is_active)}>
          {promotion.is_active ? "Pausieren / Beenden" : "Reaktivieren"}
        </button>
      </div>
    </div>
  );
}
