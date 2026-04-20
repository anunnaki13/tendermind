import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy";

  return (
    <main className="login-shell">
      <div className="login-grid">
        <section className="card hero-card login-showcase tech-frame">
          <div className="eyebrow">Secure Internal Access</div>
          <h1 className="display section-title" style={{ margin: "18px 0 14px" }}>
            Masuk ke workspace tender yang lebih rapi dan lebih serius.
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            Halaman ini menjadi titik masuk untuk dashboard internal. Pada tahap berikutnya, login akan terhubung ke
            JWT, role-based access, dan audit trail pengguna.
          </p>
          <div className="telemetry-grid" style={{ marginTop: 24, marginBottom: 24 }}>
            <div className="telemetry-card">
              <div className="telemetry-label">Access Layer</div>
              <div className="telemetry-value">JWT Gate</div>
              <div className="telemetry-note">Session admin sekarang berjalan lewat bearer token dan cookie lokal.</div>
            </div>
            <div className="telemetry-card">
              <div className="telemetry-label">Ops Context</div>
              <div className="telemetry-value">Tender Desk</div>
              <div className="telemetry-note">Akses diarahkan ke workflow dokumen, drafting, dan pipeline internal.</div>
            </div>
          </div>
          <div className="feature-list" style={{ marginTop: 28 }}>
            <div className="feature-item">
              <strong>Role-Aware Access</strong>
              <span className="muted">Admin, estimator, dan viewer akan dipisah di tahap auth produksi.</span>
            </div>
            <div className="feature-item">
              <strong>Operational Safety</strong>
              <span className="muted">Akses akan diarahkan ke modul yang paling relevan untuk workflow harian.</span>
            </div>
            <div className="feature-item">
              <strong>Auditability</strong>
              <span className="muted">Perubahan status, drafting, dan akses dokumen bisa dilacak dengan rapi.</span>
            </div>
          </div>
        </section>

        <section className="card login-panel tech-frame">
          <p className="mini-heading">Phase 1 Access</p>
          <h2 style={{ margin: "0 0 10px", fontSize: 30, letterSpacing: "-0.04em" }}>Masuk ke TenderMind</h2>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Login sudah dihubungkan ke akun admin awal berbasis JWT. Kredensial awal sengaja dibuat sederhana untuk
            bootstrap VPS ini dan sebaiknya nanti segera diganti.
          </p>
          <div className="soft-panel" style={{ marginTop: 18 }}>
            <strong style={{ display: "block", marginBottom: 8 }}>Akun awal</strong>
            <div className="muted" style={{ lineHeight: 1.7 }}>
              Email: <strong style={{ color: "var(--ink)" }}>admin@tendermind.local</strong>
              <br />
              Password: <strong style={{ color: "var(--ink)" }}>123</strong>
            </div>
          </div>
          <div className="surface-divider" style={{ margin: "20px 0 18px" }} />
          <LoginForm apiBaseUrl={apiBaseUrl} />
        </section>
      </div>
    </main>
  );
}
