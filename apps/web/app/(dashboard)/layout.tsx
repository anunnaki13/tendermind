import type { ReactNode } from "react";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Overview", marker: "01" },
  { href: "/tenders", label: "Pipeline", marker: "02" },
  { href: "/company/profile", label: "Company Profile", marker: "03" },
  { href: "/company/documents", label: "Document Vault", marker: "04" },
  { href: "/login", label: "Access", marker: "05" }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell">
      <div className="shell app-grid">
        <aside className="card sidebar">
          <div className="brand-lockup">
            <div className="eyebrow">TenderOps</div>
            <div className="brand-title">TenderMind</div>
            <div className="brand-kicker">Internal command surface for company operations</div>
          </div>

          <nav className="nav-group">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                <span>{item.label}</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {item.marker}
                </span>
              </Link>
            ))}
          </nav>

          <div className="soft-panel" style={{ marginTop: 26 }}>
            <p className="mini-heading">Current Focus</p>
            <strong style={{ display: "block", marginBottom: 8 }}>Foundation build on live VPS</strong>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Web berjalan di port `3010`, API di `8011`, dan struktur siap diteruskan ke crawler, matching, dan
              document vault.
            </p>
          </div>
        </aside>

        <div className="content-area">
          <header className="card topbar">
            <div>
              <div className="topbar-title">Operational workspace</div>
              <strong style={{ fontSize: 24, letterSpacing: "-0.04em" }}>CV Panda Global Teknologi</strong>
            </div>
            <div className="topbar-meta">
              <span className="pill">Web :3010</span>
              <span className="pill">API :8011</span>
              <span className="pill">Phase 1 Foundation</span>
            </div>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
