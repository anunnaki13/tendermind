import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default function SettingsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy";

  return (
    <section className="section-grid">
      <div className="split-hero">
        <section className="card hero-card feature-panel">
          <p className="mini-heading">Settings</p>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.05em" }}>
            Pengaturan akses admin dan kontrol keamanan dasar.
          </h1>
          <p className="lede" style={{ maxWidth: 760 }}>
            Halaman ini menjadi titik awal untuk pengelolaan akun internal. Langkah pertama yang paling penting adalah
            mengganti password bootstrap agar akses dashboard tidak bergantung pada kredensial default.
          </p>
        </section>

        <aside className="card metric-panel">
          <p className="mini-heading">Security Notes</p>
          <div className="feature-list">
            <div className="feature-item">
              <strong>Default Admin</strong>
              <span className="muted">Akun awal saat ini memakai email `admin@tendermind.local`.</span>
            </div>
            <div className="feature-item">
              <strong>Next Step</strong>
              <span className="muted">Setelah password diganti, kita bisa lanjut ke settings profil user dan audit log.</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="card table-panel" style={{ maxWidth: 720 }}>
        <p className="mini-heading">Change Password</p>
        <ChangePasswordForm apiBaseUrl={apiBaseUrl} />
      </section>
    </section>
  );
}
