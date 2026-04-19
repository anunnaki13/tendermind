const stats = [
  { label: "Tender baru", value: "12", note: "crawler belum aktif" },
  { label: "High match", value: "4", note: "akan berasal dari matching engine" },
  { label: "Dokumen expire", value: "2", note: "akan diisi compliance module" }
];

export default function DashboardPage() {
  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div className="card" style={{ padding: 28 }}>
        <p style={{ color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, fontSize: 12 }}>
          Phase 1
        </p>
        <h1 style={{ margin: "10px 0 12px" }}>Operational Command Desk</h1>
        <p style={{ color: "var(--muted)", maxWidth: 760, lineHeight: 1.7 }}>
          Dashboard ini menyiapkan struktur untuk tender discovery, company vault, dan workflow internal. Data saat ini masih placeholder agar integrasi API bisa dibangun bertahap.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {stats.map((item) => (
          <article key={item.label} className="card" style={{ padding: 20 }}>
            <div style={{ color: "var(--muted)", marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 34, fontWeight: 700 }}>{item.value}</div>
            <div style={{ color: "var(--muted)", marginTop: 10, fontSize: 14 }}>{item.note}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

