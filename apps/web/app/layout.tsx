import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spot fuer Laeden",
  description: "Profil, Aktionen und Statistiken fuer dein Spot-Business-Profil",
};

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/profile", label: "Profil" },
  { href: "/promotions", label: "Aktionen" },
  { href: "/scanner", label: "QR-Scanner" },
  { href: "/subscription", label: "Abo" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </body>
    </html>
  );
}
