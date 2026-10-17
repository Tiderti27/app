import { AuthGate } from "@/components/auth-gate";

// TODO: Kamera-Zugriff fuer QR-Scan + POST /redeem/scan, Fallback-Code-Eingabe -
// docs/spec.md Abschnitt 5 und 7.2.
export default function ScannerPage() {
  return (
    <AuthGate>
      <main className="page">
        <div>
          <h1 className="page-title">QR-Scanner</h1>
          <p className="page-subtitle">Rabattcodes deiner Kunden einlösen</p>
        </div>
        <div className="card empty-state">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
          </svg>
          <p>Scanner noch nicht verbunden.</p>
        </div>
      </main>
    </AuthGate>
  );
}
