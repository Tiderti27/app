"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { QrCamera } from "@/components/qr-camera";
import { useScanner } from "@/hooks/use-scanner";

function formatDiscount(type: "percent" | "fixed", value: number): string {
  return type === "percent" ? `${value}%` : `${value.toFixed(2)} €`;
}

export default function ScannerPage() {
  return (
    <AuthGate>
      <ScannerContent />
    </AuthGate>
  );
}

function ScannerContent() {
  const { today, loadingToday, lastResult, error, scanning, submitToken, submitFallbackCode, clearResult } = useScanner();
  const [fallbackCode, setFallbackCode] = useState("");

  const paused = scanning || lastResult !== null || error !== null;

  function handleFallbackSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fallbackCode.trim()) return;
    submitFallbackCode(fallbackCode);
    setFallbackCode("");
  }

  return (
    <main className="page">
      <div>
        <h1 className="page-title">QR-Scanner</h1>
        <p className="page-subtitle">Rabattcodes deiner Kunden einlösen</p>
      </div>

      <div className="panel-row">
        <div className="card panel panel-wide" style={{ gap: 14 }}>
          {!lastResult && !error && <QrCamera onDetect={submitToken} paused={paused} />}

          {lastResult && (
            <div className="empty-state" style={{ padding: 24 }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--score-high)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-6" />
              </svg>
              <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>Rabatt eingelöst ✓</p>
              <p>
                {lastResult.spot_name} · {lastResult.promotion_title} ·{" "}
                {formatDiscount(lastResult.discount_type, lastResult.discount_value)}
              </p>
              <button className="button-primary" onClick={clearResult} style={{ minWidth: 160 }}>
                Weiter scannen
              </button>
            </div>
          )}

          {error && (
            <div className="empty-state" style={{ padding: 24 }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--score-low)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{error}</p>
              <button className="button-primary" onClick={clearResult} style={{ minWidth: 160 }}>
                Erneut versuchen
              </button>
            </div>
          )}

          <form onSubmit={handleFallbackSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Fallback-Nummer eingeben"
              value={fallbackCode}
              onChange={(e) => setFallbackCode(e.target.value)}
              style={{
                flex: 1,
                background: "var(--bg-elevated)",
                border: "1.5px solid var(--border-input)",
                borderRadius: 10,
                padding: "11px 13px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
              }}
            />
            <button className="button-primary" type="submit" disabled={scanning} style={{ minWidth: 100 }}>
              Prüfen
            </button>
          </form>
        </div>

        <div className="card panel panel-narrow">
          <span className="panel-title">Heutige Einlösungen</span>
          {loadingToday && <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Laden...</p>}
          {!loadingToday && today.length === 0 && (
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Einlösungen heute.</p>
          )}
          {today.map((r) => (
            <div key={r.id} className="promotion-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <span className="promotion-name">{r.spot_name}</span>
              <span className="promotion-meta">
                {r.creator_username ? `@${r.creator_username} · ` : ""}
                {formatDiscount(r.discount_type, r.discount_value)} ·{" "}
                {new Date(r.redeemed_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
