"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/profile", label: "Profil" },
  { href: "/promotions", label: "Aktionen" },
  { href: "/scanner", label: "QR-Scanner" },
  { href: "/subscription", label: "Abo" },
];

export function NavBar() {
  const { session, signOut } = useAuth();

  return (
    <nav className="nav">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
      <span style={{ flex: 1 }} />
      {session ? (
        <button onClick={signOut} className="nav-action">
          Abmelden
        </button>
      ) : (
        <Link href="/login">Anmelden</Link>
      )}
    </nav>
  );
}
