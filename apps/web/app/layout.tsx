import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spot fuer Laeden",
  description: "Profil, Aktionen und Statistiken fuer dein Spot-Business-Profil",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
