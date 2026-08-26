import { AuthGate } from "@/components/auth-gate";

// TODO: Kamera-Zugriff fuer QR-Scan + POST /redeem/scan, Fallback-Code-Eingabe -
// docs/spec.md Abschnitt 5 und 7.2.
export default function ScannerPage() {
  return (
    <AuthGate>
      <main className="grid">
        <div className="card">
          <div className="stat-label">QR-Code Scanner</div>
          <p>Scanner noch nicht verbunden.</p>
        </div>
      </main>
    </AuthGate>
  );
}
