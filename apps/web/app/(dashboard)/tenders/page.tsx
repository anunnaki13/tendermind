const columns = [
  {
    title: "Discovered",
    items: ["Pengadaan SIMRS RSUD Pekanbaru", "Network Revamp Dinas X"]
  },
  {
    title: "Reviewing",
    items: ["Upgrade Data Center BUMN"]
  },
  {
    title: "Interested",
    items: ["Implementasi Smart Office"]
  },
  {
    title: "Preparing",
    items: []
  }
];

export default function TendersPage() {
  return (
    <section className="section-grid">
      <div className="card hero-card feature-panel tech-frame">
        <p className="mini-heading">Pipeline View</p>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.05em" }}>
          Tender pipeline yang bersih, mudah dipindai, dan siap diisi data nyata.
        </h1>
        <p className="lede">
          Kanban awal untuk modul tender pipeline. Nantinya data akan ditarik dari FastAPI dan update real-time.
        </p>
        <div className="telemetry-grid" style={{ marginTop: 20 }}>
          <div className="telemetry-card">
            <div className="telemetry-label">Flow</div>
            <div className="telemetry-value">Discovery to Win</div>
            <div className="telemetry-note">Tahapan dibuat ringkas agar tim langsung tahu posisi tender berikut tindakan berikutnya.</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-label">Surface</div>
            <div className="telemetry-value">Kanban Ops</div>
            <div className="telemetry-note">Visual tetap ringan, tetapi terasa seperti workstation operasional modern.</div>
          </div>
        </div>
      </div>

      <div className="board">
        {columns.map((column) => (
          <div key={column.title} className="card board-column tech-frame">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{column.title}</h2>
              <span className="badge">{column.items.length} item</span>
            </div>
            <div className="board-stack">
              {column.items.length ? (
                column.items.map((item) => (
                  <article key={item} className="board-card">
                    <strong>{item}</strong>
                    <div className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
                      Placeholder tender card untuk metadata HPS, deadline, instansi, dan quick actions.
                    </div>
                  </article>
                ))
              ) : (
                <div className="muted" style={{ fontSize: 14 }}>
                  Belum ada item
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
