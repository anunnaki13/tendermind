import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className="shell" style={{ padding: "24px 0 40px" }}>
        <header
          className="card"
          style={{
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24
          }}
        >
          <div>
            <strong>TenderMind</strong>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Foundation dashboard</div>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>CV Panda Global Teknologi</div>
        </header>
        {children}
      </div>
    </main>
  );
}

