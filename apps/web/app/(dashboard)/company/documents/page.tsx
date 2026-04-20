import { DocumentUploadForm } from "@/components/company/document-upload-form";

type DocumentItem = {
  id: number;
  title: string;
  category: string;
  notes: string | null;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  days_until_expiry: number | null;
};

type DocumentResponse = {
  summary: {
    total_documents: number;
    expiring_soon: number;
    expired: number;
  };
  items: DocumentItem[];
};

async function getDocuments(): Promise<DocumentResponse | null> {
  const baseUrl = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8011";

  try {
    const response = await fetch(`${baseUrl}/api/v1/company/documents`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as DocumentResponse;
  } catch {
    return null;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(item: DocumentItem): string {
  if (item.status === "expired") return "Expired";
  if (item.status === "expiring_soon") return item.days_until_expiry === 0 ? "Expires Today" : `Expires in ${item.days_until_expiry} days`;
  return "Active";
}

export default async function CompanyDocumentsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy";
  const data = await getDocuments();

  return (
    <section className="section-grid">
      <div className="split-hero">
        <section className="card hero-card feature-panel">
          <p className="mini-heading">Document Vault</p>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.05em" }}>
            Vault dokumen perusahaan yang rapi, bisa dicari, dan siap dipakai untuk tender.
          </h1>
          <p className="lede" style={{ maxWidth: 760 }}>
            Modul ini menjadi pondasi penyimpanan dokumen legal, sertifikasi, dan berkas pendukung perusahaan. Tahap ini
            memakai local storage di VPS agar langsung usable, sebelum nanti dipindahkan ke object storage.
          </p>
        </section>

        <aside className="card metric-panel">
          <p className="mini-heading">Vault Snapshot</p>
          <div className="feature-list">
            <div className="feature-item">
              <strong>Total Documents</strong>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.05em" }}>
                {data?.summary.total_documents ?? 0}
              </div>
            </div>
            <div className="feature-item">
              <strong>Expiring Soon</strong>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.05em" }}>
                {data?.summary.expiring_soon ?? 0}
              </div>
            </div>
            <div className="feature-item">
              <strong>Expired</strong>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.05em" }}>
                {data?.summary.expired ?? 0}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="data-grid">
        <section className="card table-panel">
          <p className="mini-heading">Upload Document</p>
          <DocumentUploadForm apiBaseUrl={apiBaseUrl} />
        </section>

        <section className="card table-panel">
          <p className="mini-heading">Document Register</p>
          <div className="feature-list">
            {data?.items.length ? (
              data.items.map((item) => (
                <article key={item.id} className="feature-item">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{item.title}</strong>
                    <span className={`status-chip ${item.status}`}>{statusLabel(item)}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {item.category} · {item.original_filename} · {formatSize(item.size_bytes)}
                  </div>
                  {item.notes ? (
                    <div className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
                      {item.notes}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={`${apiBaseUrl}/api/v1/company/documents/${item.id}/download`}
                      className="button-secondary"
                      style={{ minHeight: 40, padding: "0 14px" }}
                    >
                      Download
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="soft-panel">
                <strong>Belum ada dokumen</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Upload dokumen pertama untuk mulai membangun vault perusahaan.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
