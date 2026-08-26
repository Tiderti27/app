import { SUBSCRIPTION_PRICING } from "@spot/shared";
import { AuthGate } from "@/components/auth-gate";

// TODO: aktuelles Abo aus supabase laden, Upgrade/Downgrade via Stripe Checkout -
// docs/spec.md Abschnitt 7.2 und 8.
export default function SubscriptionPage() {
  return (
    <AuthGate>
      <main className="grid">
        {Object.entries(SUBSCRIPTION_PRICING).map(([tier, info]) => (
          <div key={tier} className="card">
            <div className="stat-label">{info.label}</div>
            <div className="stat-value">{info.priceEur} EUR/Monat</div>
          </div>
        ))}
      </main>
    </AuthGate>
  );
}
