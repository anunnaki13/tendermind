"use client";

import { useState } from "react";

type LoginState = {
  message: string;
  error: boolean;
};

export function LoginForm({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [state, setState] = useState<LoginState>({
    message: "Gunakan akun admin awal untuk masuk ke sistem.",
    error: false,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setState({ message: "Memverifikasi login...", error: false });

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login gagal.");
      }

      localStorage.setItem("tendermind_access_token", data.access_token);
      localStorage.setItem("tendermind_user_email", data.user_email);
      window.location.href = "/";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal.";
      setState({ message, error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="field-grid" style={{ marginTop: 24 }} onSubmit={handleSubmit}>
      <label className="field-label">
        <span className="field-hint">Email</span>
        <input
          type="email"
          name="email"
          defaultValue="admin@tendermind.local"
          placeholder="founder@company.com"
          className="input"
          required
        />
      </label>
      <label className="field-label">
        <span className="field-hint">Password</span>
        <input
          type="password"
          name="password"
          defaultValue="123"
          placeholder="••••••••••••"
          className="input"
          required
        />
      </label>
      <button type="submit" className="button-primary" style={{ border: "none", cursor: "pointer", opacity: loading ? 0.75 : 1 }}>
        {loading ? "Memproses..." : "Login"}
      </button>
      <span style={{ color: state.error ? "var(--danger)" : "var(--muted)", fontSize: 14 }}>{state.message}</span>
    </form>
  );
}
