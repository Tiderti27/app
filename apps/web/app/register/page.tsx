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
    <main className="grid">
      <form className="card form" onSubmit={handleSubmit}>
        <h1 style={{ margin: 0 }}>Laden registrieren</h1>
        <label>
          Ladenname
          <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </label>
        <label>
          E-Mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Passwort
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <span className="error-text">{error}</span>}
        {info && <span className="success-text">{info}</span>}
        <button className="button-primary" type="submit" disabled={submitting}>
          {submitting ? "..." : "Registrieren"}
        </button>
        <span>
          Schon ein Konto? <Link href="/login">Anmelden</Link>
        </span>
      </form>
    </main>
  );
}
