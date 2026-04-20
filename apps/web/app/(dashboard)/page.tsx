const stats = [
  { label: "Tender baru", value: "12", note: "masih placeholder sampai crawler aktif" },
  { label: "High match", value: "4", note: "akan diisi dari scoring engine" },
  { label: "Dokumen expire", value: "2", note: "akan diisi dari compliance calendar" }
];

const workstreams = [
  {
    title: "Tender Discovery",
    body: "Agregasi peluang dari LPSE dan portal e-proc dengan penyaringan cepat berdasarkan profil perusahaan."
  },
  {
    title: "Document Intelligence",
    body: "Sertifikasi, legalitas, personel, dan portofolio proyek ditata dalam satu vault yang siap dipakai untuk drafting."
  },
  {
    title: "Bid Preparation",
    body: "Pipeline penawaran bergerak dari review, interest, preparation, sampai status hasil dengan kontrol yang rapi."
  }
];

const operations = [
  { label: "API Runtime", value: "Healthy", note: "FastAPI service aktif di host" },
  { label: "Web Runtime", value: "Ready", note: "Next.js production server aktif di VPS" },
  { label: "Persistence", value: "SQLite", note: "foundation storage untuk company profile" }
];

export default function DashboardPage() {
  return (
    <section className="section-grid">
      <div className="split-hero">
        <section className="card hero-card feature-panel tech-frame">
          <p className="mini-heading">Executive View</p>
          <h1 className="display section-title" style={{ marginBottom: 14 }}>
            Operational command desk untuk tender, company data, dan keputusan eksekusi.
          </h1>
          <p className="lede" style={{ maxWidth: 720 }}>
            Dashboard ini sekarang sudah bergerak dari sekadar scaffold menjadi permukaan kerja yang lebih layak untuk
            dipakai harian. Fokus berikutnya adalah crawler LPSE, matching, document vault, dan auth produksi.
          </p>
          <div className="feature-list">
            {workstreams.map((item) => (
              <div key={item.title} className="feature-item">
                <strong>{item.title}</strong>
                <span className="muted">{item.body}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="card metric-panel tech-frame">
          <p className="mini-heading">Runtime Snapshot</p>
          <div className="feature-list">
            {operations.map((item) => (
              <div key={item.label} className="feature-item">
                <strong>{item.label}</strong>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 6 }}>{item.value}</div>
                <span className="muted">{item.note}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="kpi-row">
        {stats.map((item) => (
          <article key={item.label} className="card kpi-card">
            <div className="stat-label">{item.label}</div>
            <div className="kpi-value">{item.value}</div>
            <div className="stat-note">{item.note}</div>
          </article>
        ))}
      </div>

      <div className="data-grid">
        <section className="card table-panel tech-frame">
          <p className="mini-heading">Module Roadmap</p>
          <div className="feature-list">
            <div className="feature-item">
              <strong>Company Profile</strong>
              <span className="muted">Sudah punya read/update dasar dan storage lokal untuk development.</span>
            </div>
            <div className="feature-item">
              <strong>Pipeline Tender</strong>
              <span className="muted">Sudah punya presentasi awal, berikutnya dihubungkan ke data backend.</span>
            </div>
            <div className="feature-item">
              <strong>Deploy Surface</strong>
              <span className="muted">Systemd aktif di VPS, web dan API sudah hidup di port aman.</span>
            </div>
          </div>
        </section>

        <section className="card table-panel tech-frame">
          <p className="mini-heading">Design System</p>
          <div className="telemetry-grid" style={{ marginBottom: 18 }}>
            <div className="telemetry-card">
              <div className="telemetry-label">Visual Tone</div>
              <div className="telemetry-value">Clean Tech</div>
              <div className="telemetry-note">High-tech tanpa glow berlebihan atau dashboard yang terlalu ramai.</div>
            </div>
            <div className="telemetry-card">
              <div className="telemetry-label">UI Behaviour</div>
              <div className="telemetry-value">Focused</div>
              <div className="telemetry-note">Panel data dibuat cepat dipindai oleh owner, admin, dan estimator.</div>
            </div>
          </div>
          <div className="feature-list">
            <div className="feature-item">
              <strong>Typography</strong>
              <span className="muted">Manrope untuk UI dan Source Serif 4 untuk heading utama.</span>
            </div>
            <div className="feature-item">
              <strong>Visual Tone</strong>
              <span className="muted">Netral, bersih, dan cukup premium tanpa terlihat berlebihan.</span>
            </div>
            <div className="feature-item">
              <strong>Layout Direction</strong>
              <span className="muted">Sidebar operasional, content area jelas, dan card system yang modular.</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
