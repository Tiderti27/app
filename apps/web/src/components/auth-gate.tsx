"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { useUserProfile } from "@/context/user-profile-context";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading: authLoading, signOut } = useAuth();
  const { canAccessDashboard, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  const loading = authLoading || (session !== null && profileLoading);

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/login");
    }
  }, [authLoading, session, router]);

  if (loading || !session) {
    return (
      <main className="page">
        <div className="card">Laden...</div>
      </main>
    );
  }

  if (!canAccessDashboard) {
    return (
      <main className="page">
        <div className="card empty-state">
          <p>Dieser Bereich ist nur für Laden-Konten.</p>
          <button className="button-primary" onClick={signOut} style={{ minWidth: 140 }}>
            Abmelden
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
