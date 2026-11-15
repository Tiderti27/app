"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/context/auth-context";
import { useBusinessStats } from "@/hooks/use-business-stats";
import { supabase } from "@/lib/supabase";

const ICONS = {
  views: (
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  ),
  saves: <path d="M6 4h12v17l-6-4-6 4V4z" />,
  promotions: (
    <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
  ),
  redemptions: <path d="M12 2l2.9 6.6 7.1.6-5.4 4.6 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z" />,
};

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const { session } = useAuth();
  const { stats, todayRedemptions, loading } = useBusinessStats(7);
  const [cover, setCover] = useState<{ name: string; photo: string | null } | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("spots_view")
      .select("name, photos")
      .eq("claimed_by", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCover({ name: data.name as string, photo: (data.photos as string[])[0] ?? null });
      });
  }, [session]);

  const cards = [
    { label: "Profilaufrufe (7 Tage)", value: stats?.profile_views ?? 0, icon: ICONS.views },
    { label: "Merkliste-Saves", value: stats?.saves_total ?? 0, icon: ICONS.saves },
    { label: "Aktive Aktionen", value: stats?.active_promotions ?? 0, icon: ICONS.promotions },
    { label: "Einlösungen (7 Tage)", value: stats?.redemptions_period ?? 0, icon: ICONS.redemptions },
  ];

  return (
    <main className="page">
      <div
        className="dashboard-cover"
        style={cover?.photo ? { backgroundImage: `linear-gradient(0deg, rgba(11,11,16,0.75), rgba(11,11,16,0.4)), url(${cover.photo})` } : undefined}
      >
        <h1 className="page-title">{cover?.name ?? "Dashboard"}</h1>
        <p className="page-subtitle">Überblick über die letzten 7 Tage</p>
      </div>

      <div className="stat-grid">
        {cards.map((stat) => (
          <div key={stat.label} className="card stat-card">
            <div className="stat-card-top">
              <div className="stat-card-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {stat.icon}
                </svg>
              </div>
            </div>
            <div>
              <div className="stat-card-value">{loading ? "--" : stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-row">
        <div className="card panel panel-wide">
          <div className="panel-header">
            <span className="panel-title">Heutige Einlösungen</span>
            <Link href="/promotions" className="panel-action">
              Neue Aktion +
            </Link>
          </div>
          {!loading && todayRedemptions.length === 0 && (
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Einlösungen heute.</p>
          )}
          {todayRedemptions.map((r) => (
            <div key={r.id} className="promotion-row">
              <div>
                <div className="promotion-name">{r.spot_name}</div>
                <div className="promotion-meta">{r.creator_username ? `über @${r.creator_username}` : "Direkt"}</div>
              </div>
              <span className="creator-earnings">
                {r.discount_type === "percent" ? `${r.discount_value}%` : `${r.discount_value.toFixed(2)} €`}
              </span>
            </div>
          ))}
        </div>

        <div className="card panel panel-narrow">
          <span className="panel-title">Top Creator (7 Tage)</span>
          {!loading && !stats?.top_creator_username && (
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Einlösungen.</p>
          )}
          {stats?.top_creator_username && (
            <div className="creator-row">
              <div className="creator-avatar">{stats.top_creator_username.charAt(0).toUpperCase()}</div>
              <div>
                <div className="creator-name">@{stats.top_creator_username}</div>
                <div className="creator-meta">{stats.top_creator_redemptions} Einlösungen</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
