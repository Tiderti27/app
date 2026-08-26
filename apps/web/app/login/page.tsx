"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
    } else {
      router.push("/");
    }
  }

  return (
    <main className="grid">
      <form className="card form" onSubmit={handleSubmit}>
        <h1 style={{ margin: 0 }}>Anmelden</h1>
        <label>
          E-Mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Passwort
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <span className="error-text">{error}</span>}
        <button className="button-primary" type="submit" disabled={submitting}>
          {submitting ? "..." : "Anmelden"}
        </button>
        <span>
          Noch kein Konto? <Link href="/register">Registrieren</Link>
        </span>
      </form>
    </main>
  );
}
