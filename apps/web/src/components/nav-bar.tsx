"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/profile", label: "Profil" },
  { href: "/promotions", label: "Aktionen" },
  { href: "/scanner", label: "QR-Scanner" },
  { href: "/statistics", label: "Statistiken" },
  { href: "/subscription", label: "Abo" },
];

export function NavBar() {
  const { session, signOut } = useAuth();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setDisplayName(null);
      return;
    }
    supabase
      .from("users")
      .select("username")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setDisplayName(data?.username ?? null));
  }, [session]);

  const label = displayName ?? session?.user.email ?? "";

  return (
    <nav className="nav">
      <div className="nav-brand">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        Spot <small>für Läden</small>
      </div>

      <div className="nav-links">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : undefined}>
            {item.label}
          </Link>
        ))}
      </div>

      {session ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="user-chip">
            <span className="user-chip-avatar">{label.charAt(0).toUpperCase()}</span>
            {label}
          </div>
          <button onClick={signOut} className="nav-action">
            Abmelden
          </button>
        </div>
      ) : (
        <Link href="/login" className="nav-action">
          Anmelden
        </Link>
      )}
    </nav>
  );
}
