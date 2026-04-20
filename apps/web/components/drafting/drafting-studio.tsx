"use client";

import { useState } from "react";

type DraftResponse = {
  model: string;
  content: string;
  supporting_documents: string[];
  company_name: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
};

function readToken(): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("tendermind_access_token="));

  if (cookie) {
    return decodeURIComponent(cookie.split("=")[1] ?? "");
  }

  return localStorage.getItem("tendermind_access_token");
}

export function DraftingStudio({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DraftResponse | null>(null);
  const [status, setStatus] = useState("Susun brief tender untuk menghasilkan draft awal berbasis OpenRouter.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readToken();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!token) {
      setError("Token login tidak ditemukan. Silakan login ulang.");
      setStatus("Akses draft membutuhkan sesi login yang valid.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Menyusun prompt, menggabungkan context perusahaan, lalu meminta draft ke model...");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/drafting/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_type: formData.get("document_type"),
          tender_title: formData.get("tender_title"),
          tender_agency: formData.get("tender_agency"),
          scope_of_work: formData.get("scope_of_work"),
          evaluation_focus: formData.get("evaluation_focus") || null,
          notes: formData.get("notes") || null,
          tone: formData.get("tone"),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Gagal membuat draft.");
      }

      setResult(data as DraftResponse);
      setStatus("Draft berhasil dibuat. Tim bisa review, edit, dan copy hasilnya.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal membuat draft.");
      setStatus("Proses drafting gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="drafting-grid">
      <section className="card table-panel">
        <p className="mini-heading">Tender Brief</p>
        <form className="field-grid" onSubmit={handleSubmit}>
          <label className="field-label">
            <span className="field-hint">Jenis Draft</span>
            <input name="document_type" className="input" defaultValue="Executive Summary Proposal" required />
          </label>
          <label className="field-label">
            <span className="field-hint">Judul Tender</span>
            <input
              name="tender_title"
              className="input"
              placeholder="Pengadaan Sistem Informasi / Infrastruktur / Konsultan"
              required
            />
          </label>
          <label className="field-label">
            <span className="field-hint">Instansi / Pemberi Kerja</span>
            <input name="tender_agency" className="input" placeholder="Kementerian / Pemda / BUMN / Swasta" required />
          </label>
          <label className="field-label">
            <span className="field-hint">Lingkup Pekerjaan</span>
            <textarea
              name="scope_of_work"
              className="textarea"
              placeholder="Tuliskan ringkasan kebutuhan, ruang lingkup, target output, timeline, atau ekspektasi tender."
              required
            />
          </label>
          <label className="field-label">
            <span className="field-hint">Fokus Evaluasi</span>
            <textarea
              name="evaluation_focus"
              className="textarea"
              placeholder="Contoh: pengalaman sejenis, legalitas, SLA, metodologi implementasi, kesiapan tim."
            />
          </label>
          <label className="field-label">
            <span className="field-hint">Nada Dokumen</span>
            <input name="tone" className="input" defaultValue="formal-professional" required />
          </label>
          <label className="field-label">
            <span className="field-hint">Catatan Tambahan</span>
            <textarea
              name="notes"
              className="textarea"
              placeholder="Contoh: tonjolkan pengalaman software custom, hindari klaim yang belum ada buktinya."
            />
          </label>

          <button
            type="submit"
            className="button-primary"
            style={{ border: "none", cursor: "pointer", opacity: loading ? 0.75 : 1 }}
          >
            {loading ? "Generating..." : "Generate Draft"}
          </button>
          <span style={{ color: error ? "var(--danger)" : "var(--muted)", fontSize: 14 }}>{error ?? status}</span>
        </form>
      </section>

      <section className="card table-panel">
        <p className="mini-heading">Draft Output</p>
        {result ? (
          <div className="draft-output-shell">
            <div className="soft-panel">
              <strong style={{ display: "block", marginBottom: 8 }}>Model</strong>
              <div className="muted">{result.model}</div>
              <div className="draft-meta-row">
                <span className="pill">Company {result.company_name ?? "Unconfigured"}</span>
                <span className="pill">Prompt {result.prompt_tokens ?? "-"}</span>
                <span className="pill">Completion {result.completion_tokens ?? "-"}</span>
                <span className="pill">Total {result.total_tokens ?? "-"}</span>
              </div>
            </div>

            <div className="soft-panel">
              <strong style={{ display: "block", marginBottom: 8 }}>Supporting Documents</strong>
              {result.supporting_documents.length ? (
                <div className="draft-tag-row">
                  {result.supporting_documents.map((item) => (
                    <span key={item} className="badge">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  Belum ada dokumen yang bisa dipakai sebagai context.
                </p>
              )}
            </div>

            <article className="draft-output">{result.content}</article>
          </div>
        ) : (
          <div className="soft-panel">
            <strong>Draft belum dibuat</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Isi brief tender di panel kiri. Hasil akan muncul di sini dalam format markdown yang siap diedit tim.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
