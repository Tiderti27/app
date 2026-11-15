"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      const timeout = setTimeout(() => router.replace("/"), 1500);
      return () => clearTimeout(timeout);
    }
  }, [done, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Mindestens 6 Zeichen.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    setDone(true);
  }

  return (
    <main className="auth-page">
      <form className="card form" onSubmit={handleSubmit} style={{ width: "100%" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Neues Passwort</h1>

        {loading ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-tertiary)" }}>Lädt...</p>
        ) : !session ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-tertiary)" }}>
            Dieser Link ist ungültig oder abgelaufen. Fordere einen neuen Link unter "Passwort vergessen?" an.
          </p>
        ) : done ? (
          <p style={{ margin: 0, fontSize: 14 }}>Passwort gespeichert! Du wirst weitergeleitet...</p>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-tertiary)" }}>
              Leg ein neues Passwort für dein Konto fest.
            </p>

            <label>
              Neues Passwort
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="10" width="14" height="10" rx="2.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </label>

            <label>
              Passwort bestätigen
              <div className="input-icon-group">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="10" width="14" height="10" rx="2.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </label>

            {error && <span className="error-text">{error}</span>}

            <button className="button-primary" type="submit" disabled={submitting}>
              {submitting ? "..." : "Passwort speichern"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
