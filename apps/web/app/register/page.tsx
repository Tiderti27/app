"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await signUp(email.trim(), password, businessName.trim());
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
    } else {
      setInfo("Konto erstellt. Du kannst dich jetzt anmelden (ggf. E-Mail bestaetigen).");
    }
  }

  return (
    <main className="auth-page">
      <form className="card form" onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 20 }}>Laden registrieren</h1>
        </div>

        <label>
          Ladenname
          <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </label>
        <label>
          E-Mail
          <div className="input-icon-group">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M3 7.5l9 6 9-6" />
            </svg>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </label>
        <label>
          Passwort
          <div className="input-icon-group">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="10" width="14" height="10" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </label>

        {error && <span className="error-text">{error}</span>}
        {info && <span className="success-text">{info}</span>}

        <button className="button-primary" type="submit" disabled={submitting}>
          {submitting ? "..." : "Registrieren"}
        </button>
        <span style={{ fontSize: 13.5, textAlign: "center", color: "var(--text-tertiary)" }}>
          Schon ein Konto?{" "}
          <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
            Anmelden
          </Link>
        </span>
      </form>
    </main>
  );
}
