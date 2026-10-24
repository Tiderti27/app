"use client";

import { SUBSCRIPTION_PRICING, type SubscriptionTier } from "@spot/shared";
import { AuthGate } from "@/components/auth-gate";
import { useSubscription } from "@/hooks/use-subscription";

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  basis: ["Profil & Karteneintrag", "Basis-Statistiken", "Bis zu 2 Aktionen gleichzeitig"],
  aktiv: ["Alles aus Basis", "Unbegrenzte Aktionen", "Creator direkt kontaktieren", "Hervorgehobene Darstellung", "Detail-Statistiken"],
  premium: ["Alles aus Aktiv", "Eigene Aktionsseite", "Prioritäts-Support", "Monatlicher PDF-Report"],
};

const TIER_ORDER: SubscriptionTier[] = ["basis", "aktiv", "premium"];

export default function SubscriptionPage() {
  return (
    <AuthGate>
      <SubscriptionContent />
    </AuthGate>
  );
}

function SubscriptionContent() {
  const { subscription, loading, choosing, chooseTier } = useSubscription();

  return (
    <main className="page">
      <div>
        <h1 className="page-title">Abo</h1>
        <p className="page-subtitle">Dein aktueller Plan und Upgrade-Optionen</p>
      </div>

      <div className="card empty-state" style={{ padding: 20, textAlign: "left", alignItems: "flex-start" }}>
        <p style={{ margin: 0 }}>
          🧪 <strong>Testmodus:</strong> Hier wird noch keine echte Zahlung abgewickelt. Sobald Stripe angebunden
          ist, führt die Auswahl eines Tarifs zum Stripe-Checkout (docs/spec.md Abschnitt 8).
        </p>
      </div>

      {!loading && (
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13.5 }}>
          Aktueller Plan:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {subscription ? SUBSCRIPTION_PRICING[subscription.tier].label : "Kein aktives Abo"}
          </strong>
        </p>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {TIER_ORDER.map((tier) => {
          const info = SUBSCRIPTION_PRICING[tier];
          const isCurrent = subscription?.tier === tier;
          return (
            <div key={tier} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="stat-card-label" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {info.label}
                </div>
                <div className="stat-card-value">
                  {info.priceEur} €<span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}>/Monat</span>
                </div>
              </div>

              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {TIER_FEATURES[tier].map((feature) => (
                  <li key={feature} style={{ fontSize: 12.5, color: "var(--text-secondary)", display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--score-high)" }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="button-primary"
                type="button"
                disabled={isCurrent || choosing}
                onClick={() => chooseTier(tier)}
                style={{ marginTop: "auto" }}
              >
                {isCurrent ? "Aktueller Plan" : choosing ? "..." : "Jetzt wählen"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card panel">
        <span className="panel-title">Rechnungshistorie</span>
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>
          Noch keine Rechnungen. Rechnungen erscheinen hier, sobald echte Zahlungen über Stripe laufen.
        </p>
      </div>
    </main>
  );
}
