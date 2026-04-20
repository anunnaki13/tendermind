import Link from "next/link";

const operationalSignals = [
  "Discovery tender dari LPSE dan e-proc dalam satu command desk",
  "Company vault untuk dokumen legal, sertifikasi, dan riwayat proyek",
  "Workflow penawaran yang rapi dari screening sampai submission"
];

const landingStats = [
  { label: "Sources Planned", value: "7+", note: "LPSE nasional, LPSE daerah, BUMN e-proc" },
  { label: "Command Surface", value: "1", note: "dashboard tunggal untuk operasi tender internal" },
  { label: "Priority Window", value: "< 6h", note: "target waktu deteksi peluang relevan" }
];

export default function HomePage() {
  return (
    <main>
      <div className="shell" style={{ padding: "30px 0 72px" }}>
        <section className="hero-card card tech-frame" style={{ padding: 34 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 28
            }}
          >
            <div className="eyebrow">Internal Tender Intelligence</div>
            <div className="pill">CV Panda Global Teknologi</div>
          </div>

          <div className="split-hero">
            <div>
              <h1 className="display section-title" style={{ marginBottom: 16 }}>
                Satu sistem internal untuk menemukan, menilai, dan mengeksekusi tender dengan lebih rapi.
              </h1>
              <p className="lede" style={{ maxWidth: 760 }}>
                TenderMind dirancang sebagai command center internal: discovery tender, document vault, scoring
                kecocokan, drafting dokumen, dan pipeline bid preparation dalam satu alur kerja yang jelas.
              </p>
              <div className="button-row" style={{ marginTop: 28 }}>
                <Link href="/login" className="button-primary">
                  Masuk Dashboard
                </Link>
                <Link href="/tenders" className="button-secondary">
                  Lihat Pipeline
                </Link>
              </div>
              <div className="surface-divider" style={{ margin: "26px 0 22px" }} />
              <div className="telemetry-grid">
                <div className="telemetry-card">
                  <div className="telemetry-label">Signal Bus</div>
                  <div className="telemetry-value">LPSE + BUMN</div>
                  <div className="telemetry-note">Dirancang untuk menggabungkan beberapa sumber tender ke satu command surface.</div>
                </div>
                <div className="telemetry-card">
                  <div className="telemetry-label">Draft Engine</div>
                  <div className="telemetry-value">OpenRouter</div>
                  <div className="telemetry-note">Parsing, summary, dan proposal drafting dipisah agar biaya tetap efisien.</div>
                </div>
              </div>
            </div>

            <div className="soft-panel tech-frame">
              <p className="mini-heading">Operational Focus</p>
              <div className="signal-list">
                {operationalSignals.map((item) => (
                  <div key={item} className="signal-item">
                    <strong>{item}</strong>
                    <span className="muted">Dirancang untuk workflow internal yang cepat, terukur, dan mudah diaudit.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 22 }} className="grid-stats">
          {landingStats.map((item) => (
            <article key={item.label} className="card stat-card">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-note">{item.note}</div>
            </article>
          ))}
        </section>

        <section className="data-grid" style={{ marginTop: 22 }}>
          <article className="card feature-panel tech-frame">
            <p className="mini-heading">Design Direction</p>
            <h2 style={{ margin: "0 0 12px", fontSize: 28, letterSpacing: "-0.04em" }}>
              Clean, executive, dan sekarang bergerak ke high-tech surface yang tetap tenang
            </h2>
            <p className="muted" style={{ lineHeight: 1.75 }}>
              Antarmuka ini sekarang bergerak ke visual yang lebih tenang dan profesional: tipografi yang rapi,
              hirarki informasi yang jelas, card system yang konsisten, dan detail control-surface yang lebih modern.
            </p>
          </article>

          <article className="card feature-panel tech-frame">
            <p className="mini-heading">Core Modules</p>
            <div className="feature-list">
              <div className="feature-item">
                <strong>Company Profile & Vault</strong>
                <span className="muted">Dokumen legal, sertifikasi, personel kunci, dan portofolio terpusat.</span>
              </div>
              <div className="feature-item">
                <strong>Tender Discovery & Matching</strong>
                <span className="muted">Screening peluang baru dengan profil perusahaan dan sinyal kelayakan.</span>
              </div>
              <div className="feature-item">
                <strong>Pipeline & Drafting</strong>
                <span className="muted">Tindak lanjut tender, drafting dokumen, dan koordinasi status tim.</span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
