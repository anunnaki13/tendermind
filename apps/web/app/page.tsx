import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="shell" style={{ padding: "48px 0 72px" }}>
        <section className="card" style={{ padding: 32 }}>
          <p style={{ color: "var(--accent)", letterSpacing: 2, textTransform: "uppercase", fontSize: 12 }}>
            Internal Tender Operations
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 0.95, margin: "12px 0 20px" }}>
            TenderMind
          </h1>
          <p style={{ maxWidth: 700, fontSize: 18, lineHeight: 1.6, color: "var(--muted)" }}>
            Fondasi web internal untuk discovery tender, document vault, workflow penawaran, dan operasi perusahaan.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 28 }}>
            <Link href="/login" className="card" style={{ padding: "14px 20px", background: "var(--brand)", color: "white" }}>
              Masuk Dashboard
            </Link>
            <Link href="/tenders" className="card" style={{ padding: "14px 20px" }}>
              Lihat Pipeline Awal
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

