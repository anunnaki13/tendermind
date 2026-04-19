"use client";

import { useState } from "react";

function readToken(): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("tendermind_access_token="));

  if (cookie) {
    return decodeURIComponent(cookie.split("=")[1] ?? "");
  }

  return localStorage.getItem("tendermind_access_token");
}

export function ChangePasswordForm({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [message, setMessage] = useState("Ganti password admin awal agar akses internal lebih aman.");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readToken();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!token) {
      setError(true);
      setMessage("Token login tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError(false);
    setMessage("Menyimpan password baru...");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.get("current_password"),
          new_password: formData.get("new_password"),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Gagal mengganti password.");
      }

      setMessage("Password berhasil diubah. Gunakan password baru pada login berikutnya.");
      form.reset();
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="field-grid" onSubmit={handleSubmit}>
      <label className="field-label">
        <span className="field-hint">Password Saat Ini</span>
        <input type="password" name="current_password" className="input" required />
      </label>
      <label className="field-label">
        <span className="field-hint">Password Baru</span>
        <input type="password" name="new_password" className="input" minLength={3} required />
      </label>
      <button type="submit" className="button-primary" style={{ border: "none", cursor: "pointer", opacity: loading ? 0.75 : 1 }}>
        {loading ? "Menyimpan..." : "Update Password"}
      </button>
      <span style={{ color: error ? "var(--danger)" : "var(--muted)", fontSize: 14 }}>{message}</span>
    </form>
  );
}
