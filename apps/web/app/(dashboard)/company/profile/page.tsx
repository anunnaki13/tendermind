import { CompanyProfileForm } from "@/components/company/company-profile-form";

type CompanyProfile = {
  id: number;
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
  created_at: string;
  updated_at: string;
};

async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const baseUrl = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8011";

  try {
    const response = await fetch(`${baseUrl}/api/v1/company/profile`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CompanyProfile;
  } catch {
    return null;
  }
}

export default async function CompanyProfilePage() {
  const profile = await getCompanyProfile();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy";

  return (
    <section className="card feature-panel">
      <p className="mini-heading">Company Module</p>
      <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.05em" }}>
        Company Profile
      </h1>
      <p className="lede" style={{ maxWidth: 820 }}>
        Modul awal untuk `Company Profile & Document Vault`. Halaman ini sudah mencoba membaca data dari backend dan
        tetap memberi fallback jika API belum dijalankan.
      </p>
      <dl className="dl-grid">
        <dt>Perusahaan</dt>
        <dd>{profile?.name ?? "CV Panda Global Teknologi"}</dd>
        <dt>Badan Usaha</dt>
        <dd>{profile?.legal_form ?? "CV"}</dd>
        <dt>Domisili</dt>
        <dd>{profile ? `${profile.city ?? "-"}, ${profile.province ?? "-"}` : "Pekanbaru, Riau"}</dd>
        <dt>KBLI</dt>
        <dd>{profile?.kbli_codes.join(", ") ?? "62010, 62090"}</dd>
        <dt>NPWP</dt>
        <dd>{profile?.npwp ?? "-"}</dd>
        <dt>NIB</dt>
        <dd>{profile?.nib ?? "-"}</dd>
      </dl>
      {!profile ? (
        <p className="status-note">
          Backend belum terhubung. Jalankan API untuk melihat data persisten dari `company profile`.
        </p>
      ) : null}
      <CompanyProfileForm initialProfile={profile} apiBaseUrl={apiBaseUrl} />
    </section>
  );
}
