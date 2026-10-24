"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface UnclaimedSpot {
  id: string;
  name: string;
  address: string;
  city: string;
}

export function SpotClaimSearch({ onClaimed, onCreateNew }: { onClaimed: () => void; onCreateNew: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnclaimedSpot[]>([]);
  const [searching, setSearching] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requestedSpot, setRequestedSpot] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    const { data, error: searchError } = await supabase
      .from("spots")
      .select("id, name, address, city")
      .eq("is_claimed", false)
      .ilike("name", `%${query.trim()}%`)
      .limit(10);
    setSearching(false);
    if (searchError) setError(searchError.message);
    else setResults((data ?? []) as UnclaimedSpot[]);
  }

  async function handleClaim(spotId: string) {
    setError(null);
    const { error: claimError } = await supabase.rpc("apply_for_spot_claim", {
      p_spot_id: spotId,
      p_message: message.trim() || null,
    });
    if (claimError) {
      setError(claimError.message);
    } else {
      setRequestedSpot(spotId);
      onClaimed();
    }
  }

  return (
    <div className="card form-section" style={{ gap: 16 }}>
      <span className="form-section-title">Ist dein Laden schon bei Spot gelistet?</span>
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-tertiary)" }}>
        Such nach deinem Laden-Namen — falls er schon existiert, kannst du ihn beanspruchen, statt ein Duplikat
        anzulegen. Ein Admin prüft deine Anfrage kurz.
      </p>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="z.B. Pizzeria Bella Vista"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="button-primary" type="submit" disabled={searching}>
          {searching ? "..." : "Suchen"}
        </button>
      </form>

      {error && <span className="error-text">{error}</span>}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.map((spot) => (
            <div key={spot.id} className="data-row">
              <div className="data-row-main">
                <span className="data-row-title">{spot.name}</span>
                <span className="data-row-meta">
                  {spot.address}, {spot.city}
                </span>
              </div>
              <div className="data-row-actions">
                {requestedSpot === spot.id ? (
                  <span style={{ fontSize: 12.5, color: "var(--accent-primary)", fontWeight: 700 }}>
                    Anfrage gesendet
                  </span>
                ) : claimingId === spot.id ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Kurzer Nachweis (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{ width: 160 }}
                    />
                    <button className="pill-button accept" type="button" onClick={() => handleClaim(spot.id)}>
                      Bestätigen
                    </button>
                  </div>
                ) : (
                  <button className="pill-button" type="button" onClick={() => setClaimingId(spot.id)}>
                    Beanspruchen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onCreateNew}
        style={{
          background: "none",
          border: "none",
          color: "var(--accent-primary)",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
        }}
      >
        Mein Laden ist noch nicht gelistet → neuen Spot anlegen
      </button>
    </div>
  );
}
