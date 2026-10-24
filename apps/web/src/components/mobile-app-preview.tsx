"use client";

import { formatOpeningHours, SPOT_CATEGORIES, type OpeningHours, type SpotCategory } from "@spot/shared";

const DARK = {
  bgPrimary: "#0b0b10",
  bgCard: "#16161f",
  bgElevated: "#1e1e2a",
  accent: "#8b5cf6",
  scoreHigh: "#4ade80",
  textPrimary: "#f5f4f7",
  textSecondary: "#9c99ab",
  border: "#27262f",
};

export function MobileAppPreview({
  name,
  category,
  address,
  city,
  photos,
  openingHours,
  phone,
  website,
}: {
  name: string;
  category: SpotCategory;
  address: string;
  city: string;
  photos: string[];
  openingHours: OpeningHours;
  phone: string;
  website: string;
}) {
  const categoryLabel = SPOT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  const hoursLines = formatOpeningHours(openingHours);
  const cover = photos[0];

  return (
    <div
      style={{
        width: 280,
        borderRadius: 32,
        border: "8px solid #111",
        background: DARK.bgPrimary,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          height: 140,
          background: cover ? `url(${cover}) center/cover no-repeat` : "#161320",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: -16,
            background: DARK.bgCard,
            border: `4px solid ${DARK.bgPrimary}`,
            borderRadius: 14,
            padding: "6px 10px",
            fontSize: 16,
            fontWeight: 800,
            color: DARK.scoreHigh,
          }}
        >
          --
        </div>
      </div>

      <div style={{ padding: "22px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ color: DARK.textPrimary, fontSize: 16, fontWeight: 800, flexShrink: 1 }}>
            {name || "Name deines Spots"}
          </span>
          <span
            style={{
              background: DARK.bgCard,
              border: `1px solid ${DARK.border}`,
              borderRadius: 999,
              padding: "3px 9px",
              fontSize: 9.5,
              fontWeight: 700,
              color: DARK.textSecondary,
              flexShrink: 0,
            }}
          >
            {categoryLabel}
          </span>
        </div>

        <span style={{ color: DARK.textSecondary, fontSize: 11.5 }}>
          {address || "Adresse"}
          {city ? `, ${city}` : ""}
        </span>

        {(phone || website) && (
          <span style={{ color: DARK.textSecondary, fontSize: 11 }}>
            {[phone, website].filter(Boolean).join(" · ")}
          </span>
        )}

        <div
          style={{
            background: DARK.bgCard,
            border: `1px solid ${DARK.border}`,
            borderRadius: 12,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {hoursLines.length > 0 ? (
            hoursLines.map((line) => (
              <span key={line} style={{ color: DARK.textPrimary, fontSize: 10.5, fontWeight: 600 }}>
                {line}
              </span>
            ))
          ) : (
            <span style={{ color: DARK.textSecondary, fontSize: 10.5 }}>Keine Öffnungszeiten hinterlegt</span>
          )}
        </div>
      </div>
    </div>
  );
}
