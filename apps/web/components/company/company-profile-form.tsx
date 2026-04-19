"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type CompanyProfileFormData = {
  name: string;
  legal_form: string;
  npwp: string;
  nib: string;
  address: string;
  city: string;
  province: string;
  modal_dasar: string;
  modal_disetor: string;
  kbli_codes: string;
};

type CompanyProfile = {
  id?: number;
  name: string;
  legal_form: string | null;
  npwp: string | null;
  nib: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  modal_dasar: number | null;
  modal_disetor: number | null;
  kbli_codes: string[];
};

function buildFormState(profile: CompanyProfile | null): CompanyProfileFormData {
  return {
    name: profile?.name ?? "CV Panda Global Teknologi",
    legal_form: profile?.legal_form ?? "CV",
    npwp: profile?.npwp ?? "",
    nib: profile?.nib ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "Pekanbaru",
    province: profile?.province ?? "Riau",
    modal_dasar: profile?.modal_dasar?.toString() ?? "",
    modal_disetor: profile?.modal_disetor?.toString() ?? "",
    kbli_codes: profile?.kbli_codes.join(", ") ?? "62010, 62090"
  };
}

export function CompanyProfileForm({
  initialProfile,
  apiBaseUrl
}: {
  initialProfile: CompanyProfile | null;
  apiBaseUrl: string;
}) {
  const [form, setForm] = useState<CompanyProfileFormData>(() => buildFormState(initialProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fields = useMemo(
    () => [
      { name: "name", label: "Nama Perusahaan" },
      { name: "legal_form", label: "Badan Usaha" },
      { name: "npwp", label: "NPWP" },
      { name: "nib", label: "NIB" },
      { name: "city", label: "Kota" },
      { name: "province", label: "Provinsi" },
      { name: "modal_dasar", label: "Modal Dasar" },
      { name: "modal_disetor", label: "Modal Disetor" }
    ] as const,
    []
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/company/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          legal_form: form.legal_form || null,
          npwp: form.npwp || null,
          nib: form.nib || null,
          address: form.address || null,
          city: form.city || null,
          province: form.province || null,
          modal_dasar: form.modal_dasar ? Number(form.modal_dasar) : null,
          modal_disetor: form.modal_disetor ? Number(form.modal_disetor) : null,
          kbli_codes: form.kbli_codes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });

      if (!response.ok) {
        throw new Error("save_failed");
      }

      setStatus("Perubahan company profile tersimpan.");
    } catch {
      setStatus("Gagal menyimpan. Pastikan backend aktif dan dapat diakses.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {fields.map((field) => (
          <label key={field.name} style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>{field.label}</span>
            <input
              value={form[field.name]}
              onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
              style={{ padding: 14, borderRadius: 12, border: "1px solid var(--line)", background: "white" }}
            />
          </label>
        ))}
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 14, color: "var(--muted)" }}>Alamat</span>
        <textarea
          value={form.address}
          onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          rows={3}
          style={{ padding: 14, borderRadius: 12, border: "1px solid var(--line)", background: "white", resize: "vertical" }}
        />
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 14, color: "var(--muted)" }}>KBLI Codes</span>
        <input
          value={form.kbli_codes}
          onChange={(event) => setForm((current) => ({ ...current, kbli_codes: event.target.value }))}
          style={{ padding: 14, borderRadius: 12, border: "1px solid var(--line)", background: "white" }}
        />
      </label>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            border: "none",
            background: "var(--brand)",
            color: "white",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? "Menyimpan..." : "Simpan Company Profile"}
        </button>
        {status ? <span style={{ color: "var(--muted)", fontSize: 14 }}>{status}</span> : null}
      </div>
    </form>
  );
}
