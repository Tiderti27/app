import { SUBSCRIPTION_PRICING } from "@spot/shared";
import { AuthGate } from "@/components/auth-gate";

// TODO: aktuelles Abo aus supabase laden, Upgrade/Downgrade via Stripe Checkout -
// docs/spec.md Abschnitt 7.2 und 8.
export default function SubscriptionPage() {
  return (
    <AuthGate>
      <main className="page">
        <div>
          <h1 className="page-title">Abo</h1>
          <p className="page-subtitle">Dein aktueller Plan und Upgrade-Optionen</p>
        </div>
        <div className="stat-grid">
          {Object.entries(SUBSCRIPTION_PRICING).map(([tier, info]) => (
            <div key={tier} className="card stat-card">
              <div className="stat-card-label" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {info.label}
              </div>
              <div className="stat-card-value">{info.priceEur} €<span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}>/Monat</span></div>
            </div>
          ))}
        </div>
      </main>
    </AuthGate>
  );
}
