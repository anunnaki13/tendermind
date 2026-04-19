export default function LoginPage() {
  return (
    <main className="login-shell">
      <div className="login-grid">
        <section className="card hero-card login-showcase">
          <div className="eyebrow">Secure Internal Access</div>
          <h1 className="display section-title" style={{ margin: "18px 0 14px" }}>
            Masuk ke workspace tender yang lebih rapi dan lebih serius.
          </h1>
          <p className="lede" style={{ maxWidth: 580 }}>
            Halaman ini menjadi titik masuk untuk dashboard internal. Pada tahap berikutnya, login akan terhubung ke
            JWT, role-based access, dan audit trail pengguna.
          </p>
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

        <section className="card login-panel">
          <p className="mini-heading">Phase 1 Access</p>
          <h2 style={{ margin: "0 0 10px", fontSize: 30, letterSpacing: "-0.04em" }}>Masuk ke TenderMind</h2>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Untuk saat ini form ini masih visual placeholder, tetapi tampilannya sudah mengikuti visual language
            dashboard yang baru.
          </p>
          <form className="field-grid" style={{ marginTop: 24 }}>
            <label className="field-label">
              <span className="field-hint">Email</span>
              <input type="email" placeholder="founder@company.com" className="input" />
            </label>
            <label className="field-label">
              <span className="field-hint">Password</span>
              <input type="password" placeholder="••••••••••••" className="input" />
            </label>
            <button type="submit" className="button-primary" style={{ border: "none", cursor: "pointer" }}>
              Login
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
