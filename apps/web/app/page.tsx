import { AuthGate } from "@/components/auth-gate";

// TODO: echte Kennzahlen via supabase.from(...) laden
// (Profilaufrufe, Merkliste-Saves, aktive Aktionen, Einloesungen diese Woche).
const STATS = [
  {
    label: "Profilaufrufe",
    value: "--",
    icon: (
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    ),
  },
  {
    label: "Merkliste-Saves",
    value: "--",
    icon: <path d="M6 4h12v17l-6-4-6 4V4z" />,
  },
  {
    label: "Aktive Aktionen",
    value: "--",
    icon: (
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    ),
  },
  {
    label: "Einlösungen diese Woche",
    value: "--",
    icon: <path d="M12 2l2.9 6.6 7.1.6-5.4 4.6 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z" />,
  },
];

export default function DashboardPage() {
  return (
    <AuthGate>
      <main className="page">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Überblick über die letzten 7 Tage</p>
        </div>

        <div className="stat-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="card stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {stat.icon}
                  </svg>
                </div>
              </div>
              <div>
                <div className="stat-card-value">{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </AuthGate>
  );
}
