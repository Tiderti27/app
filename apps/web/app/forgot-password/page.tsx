"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (resetError) setError(resetError);
    else setSent(true);
  }

  return (
    <main className="auth-page">
      <form className="card form" onSubmit={handleSubmit} style={{ width: "100%" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Passwort vergessen?</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-tertiary)" }}>
          Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen.
        </p>

        {sent ? (
          <>
            <p style={{ margin: 0, fontSize: 14 }}>
              E-Mail verschickt! Prüf dein Postfach (auch den Spam-Ordner) und folge dem Link darin.
            </p>
            <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: 13.5 }}>
              Zurück zum Login
            </Link>
          </>
        ) : (
          <>
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

            {error && <span className="error-text">{error}</span>}

            <button className="button-primary" type="submit" disabled={submitting || !email.trim()}>
              {submitting ? "..." : "Link schicken"}
            </button>
            <span style={{ fontSize: 13.5, textAlign: "center", color: "var(--text-tertiary)" }}>
              <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
                Zurück zum Login
              </Link>
            </span>
          </>
        )}
      </form>
    </main>
  );
}
