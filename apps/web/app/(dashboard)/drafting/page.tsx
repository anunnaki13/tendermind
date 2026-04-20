import { DraftingStudio } from "@/components/drafting/drafting-studio";

type LLMStatus = {
  configured: boolean;
  drafter_model: string;
};

async function getLLMStatus(): Promise<LLMStatus | null> {
  const baseUrl = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8011";

  try {
    const response = await fetch(`${baseUrl}/api/v1/llm/status`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LLMStatus;
  } catch {
    return null;
  }
}

export default async function DraftingPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy";
  const llmStatus = await getLLMStatus();

  return (
    <section className="section-grid">
      <div className="split-hero">
        <section className="card hero-card feature-panel">
          <p className="mini-heading">Drafting Studio</p>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.05em" }}>
            Susun draft proposal tender lebih cepat dengan context perusahaan yang sudah tersimpan.
          </h1>
          <p className="lede" style={{ maxWidth: 760 }}>
            Studio ini merakit brief tender, profil perusahaan, dan metadata dokumen pendukung menjadi prompt yang lebih
            rapi untuk `OpenRouter`. Outputnya ditujukan sebagai draft kerja internal, bukan final tanpa review.
          </p>
        </section>

        <aside className="card metric-panel">
          <p className="mini-heading">LLM Runtime</p>
          <div className="feature-list">
            <div className="feature-item">
              <strong>Provider</strong>
              <div className="muted">OpenRouter</div>
            </div>
            <div className="feature-item">
              <strong>Drafter Model</strong>
              <div className="muted">{llmStatus?.drafter_model ?? "Unavailable"}</div>
            </div>
            <div className="feature-item">
              <strong>Configuration</strong>
              <span className={`status-chip ${llmStatus?.configured ? "active" : "expired"}`}>
                {llmStatus?.configured ? "Configured" : "API Key Missing"}
              </span>
            </div>
          </div>
        </aside>
      </div>

      <DraftingStudio apiBaseUrl={apiBaseUrl} />
    </section>
  );
}
