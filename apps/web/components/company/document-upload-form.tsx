"use client";

import { useState } from "react";

type UploadStatus = "idle" | "saving" | "success" | "error";

export function DocumentUploadForm({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("Upload dokumen legal, sertifikasi, atau berkas keuangan perusahaan.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("saving");
    setMessage("Mengunggah dokumen...");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/company/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("upload_failed");
      }

      setStatus("success");
      setMessage("Dokumen berhasil diunggah. Refresh halaman untuk melihat data terbaru.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Upload gagal. Pastikan file valid dan API aktif.");
    }
  }

  const tone = status === "error" ? "var(--danger)" : status === "success" ? "var(--accent)" : "var(--muted)";

  return (
    <form onSubmit={handleSubmit} className="field-grid">
      <label className="field-label">
        <span className="field-hint">Judul Dokumen</span>
        <input name="title" className="input" placeholder="Contoh: NIB Perusahaan" required />
      </label>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field-label">
          <span className="field-hint">Kategori</span>
          <select name="category" className="input" defaultValue="legal">
            <option value="legal">Legal</option>
            <option value="certification">Certification</option>
            <option value="finance">Finance</option>
            <option value="personnel">Personnel</option>
            <option value="portfolio">Portfolio</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="field-label">
          <span className="field-hint">Tanggal Kedaluwarsa</span>
          <input name="expires_at" type="date" className="input" />
        </label>
      </div>

      <label className="field-label">
        <span className="field-hint">Catatan</span>
        <textarea name="notes" className="textarea" placeholder="Catatan singkat atau konteks dokumen ini." />
      </label>

      <label className="field-label">
        <span className="field-hint">File</span>
        <input name="file" type="file" className="input" required />
      </label>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="button-primary" style={{ border: "none", cursor: "pointer" }}>
          Upload Document
        </button>
        <span style={{ color: tone, fontSize: 14 }}>{message}</span>
      </div>
    </form>
  );
}
