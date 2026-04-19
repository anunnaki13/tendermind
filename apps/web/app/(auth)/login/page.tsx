export default function LoginPage() {
  return (
    <main>
      <div className="shell" style={{ padding: "64px 0" }}>
        <section className="card" style={{ maxWidth: 480, margin: "0 auto", padding: 32 }}>
          <p style={{ color: "var(--accent)", marginBottom: 12 }}>Phase 1 Access</p>
          <h1 style={{ marginTop: 0 }}>Masuk ke TenderMind</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Halaman login awal. Integrasi JWT dan role-based access akan mengikuti fondasi backend.
          </p>
          <form style={{ display: "grid", gap: 16, marginTop: 24 }}>
            <input
              type="email"
              placeholder="Email"
              style={{ padding: 14, borderRadius: 12, border: "1px solid var(--line)", background: "white" }}
            />
            <input
              type="password"
              placeholder="Password"
              style={{ padding: 14, borderRadius: 12, border: "1px solid var(--line)", background: "white" }}
            />
            <button
              type="submit"
              style={{
                padding: 14,
                borderRadius: 12,
                border: "none",
                background: "var(--brand)",
                color: "white",
                cursor: "pointer"
              }}
            >
              Login
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

