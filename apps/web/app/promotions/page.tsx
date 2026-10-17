import { AuthGate } from "@/components/auth-gate";

// TODO: Aktionen anlegen (Rabatthoehe, max. Einloesungen, Gueltigkeitszeitraum,
// Creator verknuepfen) und Liste aktiver/vergangener Aktionen -
// docs/spec.md Abschnitt 5 und 7.2.
export default function PromotionsPage() {
  return (
    <AuthGate>
      <main className="page">
        <div>
          <h1 className="page-title">Aktionen</h1>
          <p className="page-subtitle">Rabattcodes über Creator ausspielen</p>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
          </svg>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>Noch keine Aktion erstellt.</p>
        </div>
      </main>
    </AuthGate>
  );
}
