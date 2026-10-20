"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Spot, UserRole } from "@spot/shared";
import { useAuth } from "@/context/auth-context";
import { useUserProfile } from "@/context/user-profile-context";
import { useAdmin } from "@/hooks/use-admin";
import { useAdminSpots } from "@/hooks/use-admin-spots";
import { AdminSpotEditor } from "@/components/admin-spot-editor";

const ROLE_OPTIONS: UserRole[] = ["consumer", "creator", "business"];

export default function AdminPage() {
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session) router.replace("/login");
  }, [authLoading, session, router]);

  const loading = authLoading || (session !== null && profileLoading);

  if (loading) {
    return (
      <main className="page">
        <div className="card">Laden...</div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="page">
        <div className="card empty-state">
          <p>Kein Zugriff. Dieser Bereich ist nur für Admin-Konten.</p>
        </div>
      </main>
    );
  }

  return <AdminContent />;
}

function AdminContent() {
  const { businesses, pendingApplications, users, loading, reviewApplication, setUserRole, setAdminFlag } = useAdmin();
  const {
    spots,
    businesses: businessUsers,
    loading: spotsLoading,
    createSpot,
    updateSpot,
    deleteSpot,
  } = useAdminSpots();
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [creatingSpot, setCreatingSpot] = useState(false);

  return (
    <main className="page">
      <div>
        <h1 className="page-title">Admin</h1>
        <p className="page-subtitle">Plattform-Übersicht: Spots, Läden, Creator-Bewerbungen und Nutzerverwaltung</p>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <span className="panel-title">Alle Spots</span>
          <button className="panel-action" type="button" onClick={() => setCreatingSpot(true)}>
            Neuer Spot +
          </button>
        </div>

        {creatingSpot && (
          <AdminSpotEditor
            spot={null}
            businesses={businessUsers}
            onSave={createSpot}
            onCancel={() => setCreatingSpot(false)}
          />
        )}

        {editingSpot && (
          <AdminSpotEditor
            spot={editingSpot}
            businesses={businessUsers}
            onSave={(input) => updateSpot(editingSpot.id, input)}
            onCancel={() => setEditingSpot(null)}
          />
        )}

        {!spotsLoading && spots.length === 0 && (
          <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Spots angelegt.</p>
        )}
        {!editingSpot &&
          !creatingSpot &&
          spots.map((spot) => (
            <div key={spot.id} className="data-row">
              <div className="data-row-main">
                <span className="data-row-title">{spot.name}</span>
                <span className="data-row-meta">
                  {spot.category} · {spot.city} · Score {spot.score} ·{" "}
                  {spot.is_claimed ? "vergeben" : "nicht vergeben"}
                </span>
              </div>
              <div className="data-row-actions">
                <button className="pill-button" onClick={() => setEditingSpot(spot)}>
                  Bearbeiten
                </button>
                <button className="pill-button reject" onClick={() => deleteSpot(spot.id)}>
                  Löschen
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="card panel">
        <span className="panel-title">Offene Creator-Bewerbungen</span>
        {!loading && pendingApplications.length === 0 && (
          <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Keine offenen Bewerbungen.</p>
        )}
        {pendingApplications.map((app) => (
          <div key={app.id} className="data-row">
            <div className="data-row-main">
              <span className="data-row-title">
                {[
                  app.tiktok_handle && `TikTok: ${app.tiktok_handle}`,
                  app.instagram_handle && `Instagram: ${app.instagram_handle}`,
                  app.youtube_handle && `YouTube: ${app.youtube_handle}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {app.message && <span className="data-row-meta">{app.message}</span>}
            </div>
            <div className="data-row-actions">
              <button className="pill-button accept" onClick={() => reviewApplication(app.id, true)}>
                Annehmen
              </button>
              <button className="pill-button reject" onClick={() => reviewApplication(app.id, false)}>
                Ablehnen
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card panel">
        <span className="panel-title">Business-Statistiken</span>
        {!loading && businesses.length === 0 && (
          <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13.5 }}>Noch keine Läden registriert.</p>
        )}
        {businesses.map((b) => (
          <div key={b.business_id} className="data-row">
            <div className="data-row-main">
              <span className="data-row-title">@{b.username}</span>
              <span className="data-row-meta">
                {b.spot_name ?? "Kein Profil angelegt"} · {b.active_promotions} aktive Aktionen ·{" "}
                {b.redemptions_total} Einlösungen · {b.saves_total} Saves
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card panel">
        <span className="panel-title">Alle Nutzer</span>
        {users.map((u) => (
          <div key={u.id} className="data-row">
            <div className="data-row-main">
              <span className="data-row-title">@{u.username}</span>
              <span className="data-row-meta">{u.email}</span>
            </div>
            <div className="data-row-actions">
              <select value={u.role} onChange={(e) => setUserRole(u.id, e.target.value as UserRole)}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={u.is_admin} onChange={(e) => setAdminFlag(u.id, e.target.checked)} />
                Admin
              </label>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
