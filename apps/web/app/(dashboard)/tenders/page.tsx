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
    <section>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Pipeline Tender</h1>
        <p style={{ color: "var(--muted)" }}>
          Kanban awal untuk modul tender pipeline. Nantinya data akan ditarik dari FastAPI dan update real-time.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {columns.map((column) => (
          <div key={column.title} className="card" style={{ padding: 16 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{column.title}</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {column.items.length ? (
                column.items.map((item) => (
                  <article key={item} style={{ padding: 14, borderRadius: 14, background: "white", border: "1px solid var(--line)" }}>
                    <strong>{item}</strong>
                    <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Placeholder tender card</div>
                  </article>
                ))
              ) : (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Belum ada item</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

