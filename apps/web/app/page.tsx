// TODO: echte Kennzahlen via supabase.from(...) laden
// (Profilaufrufe, Merkliste-Saves, aktive Aktionen, Einloesungen diese Woche).
const STATS = [
  { label: "Profilaufrufe (7 Tage)", value: "--" },
  { label: "Merkliste-Saves", value: "--" },
  { label: "Aktive Aktionen", value: "--" },
  { label: "Einloesungen diese Woche", value: "--" },
];

export default function DashboardPage() {
  return (
    <main className="grid">
      {STATS.map((stat) => (
        <div key={stat.label} className="card">
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
      ))}
    </main>
  );
}
