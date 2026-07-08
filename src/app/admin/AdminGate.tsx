"use client";

import { useState, type FormEvent } from "react";

/**
 * Minimal client-side admin password form. It deliberately does NOT import the
 * kit's `PasswordGate`: that component ships from the same module as the
 * node:crypto verify helpers, so pulling it into a client bundle drags
 * node:crypto in and breaks the build. The crypto lives server-side only (the
 * admin layout + /api/admin-gate route). This form just POSTs the password.
 */
export function AdminGate({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <main className="wrap">
        <div className="notice">
          Admin gate isn’t configured. Set <code>ADMIN_PASSWORD_HASH</code> and{" "}
          <code>ADMIN_GATE_SECRET</code> (see <code>.env.example</code>) to
          unlock the admin.
        </div>
      </main>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-gate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setError("That password wasn’t recognized.");
    } catch {
      setError("Something went wrong. Try again.");
    }
    setBusy(false);
  }

  return (
    <main className="wrap" style={{ maxWidth: 400 }}>
      <header className="masthead">
        <h1>Sushi Deck · Admin</h1>
      </header>
      <form onSubmit={submit}>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error ? (
          <div className="notice" style={{ marginBottom: 14 }}>
            {error}
          </div>
        ) : null}
        <button className="btn" type="submit" disabled={busy || !password}>
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
