"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useBusinessStats } from "@/hooks/use-business-stats";
import { supabase } from "@/lib/supabase";
import type { CreatorBreakdown } from "@spot/shared";

export default function StatisticsPage() {
  return (
    <AuthGate>
      <StatisticsContent />
    </AuthGate>
  );
}

function StatisticsContent() {
  const { stats: stats7, loading: loading7 } = useBusinessStats(7);
  const { stats: stats30, loading: loading30 } = useBusinessStats(30);
  const [breakdown, setBreakdown] = useState<CreatorBreakdown[]>([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(true);

  useEffect(() => {
    supabase
      .rpc("business_creator_breakdown", { p_days: 30 })
      .then(({ data }) => {
        setBreakdown((data ?? []) as CreatorBreakdown[]);
        setLoadingBreakdown(false);
      });
  }, []);

  const maxRedemptions = breakdown.length > 0 ? breakdown[0].redemption_count : 0;

  return (
    <main className="page">
      <div>
        <h1 className="page-title">Statistiken</h1>
        <p className="page-subtitle">Profilaufrufe, Einlösungen und Creator-Performance</p>
      </div>

      <div className="panel-row">
        <div className="card panel panel-narrow">
          <span className="panel-title">Letzte 7 Tage</span>
          <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <div className="stat-card-value">{loading7 ? "--" : stats7?.profile_views ?? 0}</div>
              <div className="stat-card-label">Profilaufrufe</div>
            </div>
            <div>
              <div className="stat-card-value">{loading7 ? "--" : stats7?.redemptions_period ?? 0}</div>
              <div className="stat-card-label">Einlösungen</div>
            </div>
          </div>
        </div>

        <div className="card panel panel-narrow">
          <span className="panel-title">Letzte 30 Tage</span>
          <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <div className="stat-card-value">{loading30 ? "--" : stats30?.profile_views ?? 0}</div>
              <div className="stat-card-label">Profilaufrufe</div>
            </div>
            <div>
              <div className="stat-card-value">{loading30 ? "--" : stats30?.redemptions_period ?? 0}</div>
              <div className="stat-card-label">Einlösungen</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card panel">
        <span className="panel-title">Einlösungen pro Creator (30 Tage)</span>
        {!loadingBreakdown && breakdown.length === 0 && (
          <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Einlösungen.</p>
        )}
        <div className="promo-list">
          {breakdown.map((row) => (
            <div key={row.creator_username} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 90, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>@{row.creator_username}</span>
              <div className="promotion-progress-track" style={{ flex: 1 }}>
                <div
                  className="promotion-progress-fill"
                  style={{ width: `${maxRedemptions > 0 ? (row.redemption_count / maxRedemptions) * 100 : 0}%` }}
                />
              </div>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", width: 70, textAlign: "right" }}>
                {row.redemption_count} Stück
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card panel">
        <span className="panel-title">Merkliste-Saves</span>
        <div className="stat-card-value">{loading30 ? "--" : stats30?.saves_total ?? 0}</div>
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 12.5 }}>
          Gesamtzahl über alle deine Spots (Zeitverlauf folgt mit mehr Datenpunkten).
        </p>
      </div>
    </main>
  );
}
