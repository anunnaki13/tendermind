# TENDERMIND

**AI-Powered Tender Discovery, Bid Automation & Company Operations Platform**

> Internal system untuk CV Panda Global Teknologi — otomasi pencarian lelang, drafting dokumen penawaran, monitoring, dan manajemen operasional perusahaan.

---

## 📋 Daftar Isi

1. [Overview & Objectives](#1-overview--objectives)
2. [Scope & Non-Scope](#2-scope--non-scope)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Core Modules](#5-core-modules)
6. [Data Model](#6-data-model)
7. [Scraping Strategy](#7-scraping-strategy)
8. [AI/LLM Integration](#8-aillm-integration)
9. [Telegram Bot Interface](#9-telegram-bot-interface)
10. [Security & Compliance](#10-security--compliance)
11. [Development Roadmap](#11-development-roadmap)
12. [Project Structure](#12-project-structure)
13. [Environment Variables](#13-environment-variables)
14. [Deployment](#14-deployment)
15. [Claude Code Usage Notes](#15-claude-code-usage-notes)

---

## 1. Overview & Objectives

### 1.1 Context

CV Panda Global Teknologi perlu sistem internal yang:
- Memantau peluang lelang dari berbagai sumber (LPSE, e-Proc BUMN, portal swasta) secara otomatis 24/7
- Menyaring hanya tender yang sesuai profil perusahaan (KBLI, modal, pengalaman, domisili)
- Membantu drafting dokumen penawaran berbasis AI
- Mengelola siklus hidup tender dari discovery → submission → monitoring → post-award
- Mengelola dokumen legal perusahaan, sertifikasi, dan reminder masa berlaku
- Memberikan dashboard intelijen pasar (kompetitor, winning price, pattern PPK)

### 1.2 Objectives

| # | Objective | Success Metric |
|---|-----------|----------------|
| O1 | Otomatisasi discovery tender | ≥ 95% tender relevan ter-crawl dalam ≤ 6 jam sejak publikasi |
| O2 | Reduksi waktu bid preparation | Dari ~3 hari jadi ≤ 4 jam per tender |
| O3 | Central repository dokumen perusahaan | 100% dokumen legal tersimpan, reminder expire ≥ 30 hari sebelum |
| O4 | Win rate tracking & intelligence | Dashboard historis pemenang, HPS vs kontrak nilai |
| O5 | Cashflow & kontrak management | Tracking termin, invoice, retensi real-time |

### 1.3 Users

- **Primary**: Budi (founder, decision maker)
- **Secondary**: Tim admin/estimator (akses terbatas)
- **Interface**: Web dashboard + Telegram bot (mobile-first untuk notifikasi)

---

## 2. Scope & Non-Scope

### 2.1 In Scope (MVP + V2)

**MVP (3 bulan pertama):**
- Crawler multi-source (LPSE nasional, LPSE Riau, 3–5 e-Proc BUMN)
- Matching engine berbasis KBLI, modal, domisili, SBU
- Document vault perusahaan dengan reminder
- AI drafting: surat penawaran, pakta integritas, surat dukungan
- Dashboard web (Next.js) + notifikasi Telegram
- Tracking status tender (discovered → interested → submitted → result)

**V2 (bulan 4–6):**
- Semi-auto submission (generate paket ZIP siap upload)
- Intelligence dashboard (winning price analytics, competitor tracking)
- Post-award: kontrak, termin pembayaran, BAST, retensi
- Compliance calendar otomatis
- RAB/BoQ estimator dengan margin recommendation
- Integrasi OCR untuk RKS/KAK scan

**V3 (bulan 7+):**
- Vector search semantic untuk "tender mirip proyek X yang pernah kita kerjakan"
- Consortium matchmaking (kalau ekspansi ke external user)
- Browser extension untuk assisted submission

### 2.2 Out of Scope

- Fully automated submission ke LPSE (legal risk, captcha, digital cert)
- Akuntansi lengkap (pakai tools existing: Jurnal/Accurate)
- HR/Payroll
- CRM klien non-tender

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                         │
├──────────────────────┬──────────────────────┬───────────────────┤
│   Next.js Web App    │   Telegram Bot       │   Email Digest    │
│   (Dashboard)        │   (Notif + Cmd)      │   (Daily/Weekly)  │
└──────────┬───────────┴──────────┬───────────┴─────────┬─────────┘
           │                      │                     │
           └──────────────────────┼─────────────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │   FastAPI Backend  │
                        │   (REST + WS)      │
                        └─────────┬──────────┘
                                  │
      ┌───────────────┬───────────┼───────────┬──────────────┐
      │               │           │           │              │
┌─────▼─────┐  ┌──────▼─────┐  ┌─▼────┐  ┌───▼────┐  ┌──────▼─────┐
│ MongoDB   │  │ PostgreSQL │  │Redis │  │ MinIO  │  │  Qdrant    │
│ (tenders, │  │ (contracts,│  │(queue│  │ (docs, │  │ (semantic  │
│  crawled) │  │  financial)│  │ cache│  │  PDFs) │  │  search)   │
└───────────┘  └────────────┘  └──────┘  └────────┘  └────────────┘
      ▲               ▲           ▲           ▲              ▲
      └───────────────┴───────────┼───────────┴──────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │   Celery Workers   │
                        │  ┌──────────────┐  │
                        │  │ Scraping     │  │
                        │  │ Parsing (AI) │  │
                        │  │ Matching     │  │
                        │  │ Drafting     │  │
                        │  │ Notif        │  │
                        │  └──────────────┘  │
                        └─────────┬──────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
      ┌───────▼──────┐  ┌─────────▼────────┐ ┌───────▼───────┐
      │  Playwright  │  │  LLM Gateway     │ │  External     │
      │  Scrapers    │  │  (Gemini/Claude) │ │  APIs         │
      └──────────────┘  └──────────────────┘ └───────────────┘
```

### 3.2 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Next.js Web** | Dashboard, document management, deep-dive analytics, bid editor |
| **Telegram Bot** | Push notif tender baru, quick actions (interested/skip), status queries |
| **FastAPI** | REST API, WebSocket real-time update, auth |
| **MongoDB** | Raw tender data, crawl history, unstructured data |
| **PostgreSQL** | Contracts, financial records, company profile, transactional data |
| **Redis** | Celery broker, cache, rate limiting, session |
| **MinIO** | Object storage: dokumen perusahaan, RKS/KAK PDF, draft output |
| **Qdrant** | Vector embeddings untuk semantic search proyek & tender mirip |
| **Celery** | Task queue: scraping, parsing, matching, notif, drafting |
| **Playwright** | Browser automation untuk LPSE (JS-heavy, captcha-aware) |

### 3.3 Kenapa Dual Database?

- **MongoDB**: tender baru terus masuk dengan schema variatif (setiap LPSE beda format). Flexible schema cocok.
- **PostgreSQL**: keuangan, kontrak, termin butuh ACID + relational integrity kuat.

---

## 4. Tech Stack

### 4.1 Backend

| Layer | Technology | Justifikasi |
|-------|-----------|-------------|
| API Framework | **FastAPI** (Python 3.12) | Familiar dari EMITS/INSIGHT-K3, async-first, auto OpenAPI |
| Task Queue | **Celery + Redis** | Industry standard, mature, retry & scheduling built-in |
| ORM | **SQLAlchemy 2.0** (async) + **Beanie** (MongoDB ODM) | Type-safe, async |
| Scraping | **Playwright** (primary) + **httpx** + **BeautifulSoup4** | Playwright untuk JS-heavy LPSE, httpx untuk REST |
| PDF/OCR | **pypdfium2** + **pytesseract** + **pdfplumber** | Combo untuk native PDF + scanned |
| LLM Client | **google-generativeai** + **anthropic** | Gemini untuk bulk parsing, Claude untuk drafting |
| Vector | **qdrant-client** | Self-hostable, fast |
| Auth | **python-jose** (JWT) + **passlib** (bcrypt) | Standard |

### 4.2 Frontend

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router) |
| UI | **shadcn/ui** + **Tailwind CSS** |
| State | **Zustand** + **TanStack Query** |
| Forms | **React Hook Form** + **Zod** |
| Charts | **Recharts** |
| Tables | **TanStack Table** |
| Rich Editor | **Tiptap** (untuk edit draft penawaran) |
| WebSocket | **native WebSocket API** |

### 4.3 Infrastructure

| Layer | Technology |
|-------|-----------|
| Container | **Docker + Docker Compose** |
| Reverse Proxy | **Caddy** (auto-HTTPS) |
| Monitoring | **Grafana + Prometheus** (optional untuk MVP) |
| Logging | **Loki** + **structlog** |
| VPS | **Contabo / Biznet Gio / Hetzner** (min 4 vCPU, 8GB RAM, 160GB SSD) |

### 4.4 External Services

| Service | Use Case |
|---------|---------|
| **Google Gemini API** (2.5 Flash) | Bulk parsing RKS/KAK, classification, extraction |
| **Anthropic Claude API** (Sonnet 4.6) | High-quality document drafting |
| **Telegram Bot API** | Notifikasi & command interface |
| **SMTP (Zoho/Resend)** | Email digest |
| **Sentry** (optional) | Error tracking |

---

## 5. Core Modules

### 5.1 Module List

| # | Module | Priority |
|---|--------|----------|
| M1 | Company Profile & Document Vault | P0 (MVP) |
| M2 | Tender Discovery Engine (Crawler) | P0 (MVP) |
| M3 | Tender Parser & Classifier | P0 (MVP) |
| M4 | Matching & Scoring Engine | P0 (MVP) |
| M5 | Notification Hub (Telegram + Email) | P0 (MVP) |
| M6 | Tender Pipeline Tracker | P0 (MVP) |
| M7 | AI Document Drafter | P0 (MVP) |
| M8 | Bid Package Generator | P1 (V2) |
| M9 | Market Intelligence Dashboard | P1 (V2) |
| M10 | Contract & Financial Tracker | P1 (V2) |
| M11 | Compliance Calendar | P1 (V2) |
| M12 | Semantic Project Memory | P2 (V3) |
| M13 | Regulatory Watch | P2 (V3) |

---

### M1 — Company Profile & Document Vault

**Tujuan**: single source of truth untuk identitas perusahaan & semua dokumen legal.

**Data yang disimpan:**
- **Identitas**: nama PT/CV, NPWP, NIB, alamat domisili, KBLI list, modal dasar, modal disetor, bentuk badan usaha
- **Sertifikasi**: SBU (kode + grade + expire), ISO (9001, 14001, 45001, 27001), K3, SMK3, sertifikasi brand (Cisco, AWS, etc.)
- **Dokumen legal**: akta pendirian, akta perubahan, SK Kemenkumham, TDP, SIUP/NIB, surat domisili
- **Keuangan**: laporan keuangan 3 tahun terakhir (PDF), SPT tahunan, SPT masa PPh/PPN
- **Tenaga ahli (CV)**: struktur organisasi, CV karyawan kunci (nama, pendidikan, sertifikasi, pengalaman)
- **Portofolio proyek**: nama proyek, pemberi kerja, nilai kontrak, durasi, deskripsi, PIC, referensi

**Fitur:**
- Upload dokumen ke MinIO, versioning
- Field expire tracker (SBU, ISO, SPT) → trigger reminder 90/60/30/7 hari sebelum
- Quick view: "Dokumen apa yang perlu diperbarui bulan ini?"
- Template variables: data otomatis dipakai saat drafting (misal `{{company.name}}`, `{{company.npwp}}`)

---

### M2 — Tender Discovery Engine (Crawler)

**Sumber target MVP:**

| Sumber | URL | Metode | Frekuensi |
|--------|-----|--------|-----------|
| LPSE Nasional (Inaproc) | inaproc.id | Scrape + API (jika ada) | 2 jam sekali |
| LPSE Kementerian PU | lpse.pu.go.id | Playwright | 2 jam sekali |
| LPSE Prov. Riau | lpse.riau.go.id | Playwright | 1 jam sekali |
| LPSE Pekanbaru | lpse.pekanbaru.go.id | Playwright | 1 jam sekali |
| e-Proc PLN | eproc.pln.co.id | Playwright (auth) | 3 jam sekali |
| e-Proc Pertamina | ptm-eproc.pertamina.com | Playwright | 3 jam sekali |
| e-Proc Telkom | smileup.telkom.co.id | Playwright | 3 jam sekali |

**Arsitektur crawler:**

```
┌─────────────────────────────────────────────┐
│         Scraper Orchestrator                │
│  (Celery Beat — schedule per source)        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Source Adapter (base class)         │
│  ┌──────────────────────────────────────┐  │
│  │  LPSESourceAdapter                   │  │
│  │  PLNEProcAdapter                     │  │
│  │  PertaminaEProcAdapter               │  │
│  │  ... (1 adapter per source)          │  │
│  └──────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│     Normalization Pipeline                  │
│  - Dedup (fingerprint: source + tender_id)  │
│  - Schema unification                       │
│  - Store raw HTML + structured to MongoDB   │
└─────────────────────────────────────────────┘
```

**Base adapter interface:**

```python
class BaseSourceAdapter(ABC):
    source_id: str
    base_url: str
    requires_auth: bool = False
    
    @abstractmethod
    async def list_new_tenders(self, since: datetime) -> list[TenderListItem]:
        """Return list of tender IDs + minimal metadata."""
    
    @abstractmethod
    async def fetch_detail(self, tender_id: str) -> TenderDetail:
        """Full detail including attachments."""
    
    @abstractmethod
    async def download_documents(self, tender_id: str) -> list[Document]:
        """Download RKS, KAK, BOQ, etc."""
```

**Strategi anti-block:**
- Rotating user-agents
- Respect robots.txt (kecuali halaman pengumuman publik)
- Random delay 2–8 detik antar request
- Proxy rotation (optional, pakai Bright Data atau residential proxy Indonesia)
- Playwright dengan stealth plugin
- Retry exponential backoff

**Captcha handling:**
- LPSE biasanya captcha saat login / download doc. Gunakan 2captcha API sebagai fallback.
- Untuk browse publik umumnya tidak perlu captcha.

---

### M3 — Tender Parser & Classifier

**Input**: raw HTML + PDF attachment (RKS, KAK, BOQ, addendum)

**Output**: structured tender object:

```python
class Tender(BaseModel):
    # Identitas
    id: str  # uuid internal
    source_id: str  # "lpse_riau", "eproc_pln"
    source_tender_id: str  # ID asli di sumber
    url: str
    
    # Basic info
    title: str
    instansi: str  # Pemberi kerja
    satker: str | None  # Satuan kerja
    jenis_pengadaan: Literal["barang", "jasa_konsultansi", "jasa_lainnya", "pekerjaan_konstruksi"]
    metode_pengadaan: Literal["tender", "tender_cepat", "seleksi", "pl", "e_purchasing"]
    
    # Financial
    hps: Decimal | None  # Harga Perkiraan Sendiri
    pagu: Decimal | None
    sumber_dana: str | None  # APBN, APBD, BUMN internal
    tahun_anggaran: int | None
    
    # Requirements
    kbli_required: list[str]
    sbu_required: list[str]  # ["SI004-M1", "SI003-K2"]
    kualifikasi: Literal["kecil", "menengah", "besar", "non_kecil"]
    pengalaman_required: str | None  # Parsed by LLM
    sertifikasi_required: list[str]  # ISO 9001, K3, etc
    modal_min: Decimal | None
    
    # Timeline
    published_at: datetime
    registration_deadline: datetime
    submission_deadline: datetime
    opening_date: datetime | None
    
    # Location
    lokasi_pekerjaan: str  # e.g., "Pekanbaru, Riau"
    
    # Attachments
    documents: list[DocumentRef]  # MinIO paths
    
    # AI-generated
    summary: str  # 3-5 sentence ringkasan dari LLM
    scope_of_work: list[str]  # Parsed item2 pekerjaan utama
    risks_flags: list[str]  # "Pengalaman 5 thn", "Wajib SBU grade M"
    
    # Matching
    match_score: float  # 0-1
    match_reasons: list[str]
    eligibility: Literal["eligible", "partial", "ineligible"]
    missing_requirements: list[str]
    
    # Pipeline
    status: Literal["discovered", "reviewing", "interested", "preparing", "submitted", "won", "lost", "cancelled"]
    notes: str | None
```

**Parsing strategy:**

1. **HTML structured fields** → rule-based (BeautifulSoup selectors per adapter)
2. **PDF attachments** → dua jalur:
   - Native PDF: `pdfplumber` extract text → Gemini untuk structuring
   - Scanned PDF: `pytesseract` OCR → Gemini untuk cleaning + structuring
3. **Extraction prompt** (Gemini 2.5 Flash):

```text
Anda adalah parser dokumen pengadaan Indonesia. Ekstrak dari dokumen berikut:

{document_text}

Output JSON:
{
  "kbli_required": [],
  "sbu_required": [{"code": "", "grade": ""}],
  "kualifikasi": "",
  "pengalaman_minimum": "",
  "sertifikasi": [],
  "scope_of_work": [],
  "modal_minimum_idr": null,
  "jaminan_penawaran_persen": null,
  "masa_pelaksanaan_hari": null,
  "lokasi": ""
}

Hanya balas JSON valid. Null jika tidak disebut.
```

---

### M4 — Matching & Scoring Engine

**Tujuan**: beri skor 0–100 seberapa cocok tender dengan profil CV Panda Global Teknologi.

**Scoring components:**

```
score = w1 * kbli_match
      + w2 * sbu_match
      + w3 * modal_eligibility
      + w4 * pengalaman_match
      + w5 * domisili_bonus
      + w6 * kapasitas_finansial
      + w7 * historical_similarity
```

**Detail:**

| Component | Weight | Logic |
|-----------|--------|-------|
| KBLI match | 25 | 100 jika KBLI required ⊆ KBLI perusahaan, 0 jika tidak sama sekali |
| SBU match | 20 | Cek kode + grade, parsial score jika punya kode tapi grade beda |
| Modal eligibility | 15 | 100 jika modal disetor ≥ modal_min, else 0 (hard filter) |
| Pengalaman match | 15 | Semantic similarity proyek historis vs scope tender |
| Domisili bonus | 10 | +bonus jika lokasi pekerjaan sama provinsi |
| Kapasitas finansial | 10 | Tender value vs rata2 kontrak historis (jangan terlalu besar) |
| Historical similarity | 5 | Vector similarity ke tender yang pernah dimenangkan |

**Classification:**
- Score ≥ 70 → **"highly eligible"** → push notif prioritas
- Score 40–69 → **"partial"** → masuk daftar review
- Score < 40 → **"ineligible"** → simpan tapi tidak notif

**Hard filter (langsung reject):**
- Modal disetor tidak cukup
- Wajib SBU yang sama sekali tidak punya
- Deadline submit < 48 jam dan belum ada prep

---

### M5 — Notification Hub

**Channels:**
1. **Telegram** (primary, real-time)
2. **Email** (digest harian & mingguan)
3. **Web dashboard** (in-app notif)

**Event types:**

| Event | Channel | Timing |
|-------|---------|--------|
| Tender baru highly-eligible | Telegram (immediate) + Web | < 15 menit setelah crawl |
| Tender partial match | Email digest | Harian jam 08:00 |
| Deadline submit H-3 | Telegram + Email | 3 hari sebelum |
| Deadline submit H-1 | Telegram (urgent) | 1 hari sebelum |
| Pengumuman pemenang | Telegram + Email | Saat detected |
| Dokumen perusahaan expire H-30 | Telegram + Email | 30 hari sebelum |
| Dokumen perusahaan expire H-7 | Telegram (urgent) | 7 hari sebelum |
| Tender status update | Web in-app | Real-time |
| Weekly summary | Email | Setiap Senin 07:00 |

---

### M6 — Tender Pipeline Tracker

**Kanban-style board di web dashboard:**

```
┌───────────┬───────────┬──────────┬────────────┬───────────┬────────┬────────┐
│Discovered │ Reviewing │Interested│ Preparing  │ Submitted │  Won   │  Lost  │
├───────────┼───────────┼──────────┼────────────┼───────────┼────────┼────────┤
│ Card      │ Card      │ Card     │ Card       │ Card      │ Card   │ Card   │
│ Card      │ Card      │ Card     │ Card       │ Card      │        │ Card   │
│ Card      │           │          │            │           │        │        │
└───────────┴───────────┴──────────┴────────────┴───────────┴────────┴────────┘
```

**Per-card metadata:**
- Judul, instansi, nilai HPS
- Countdown deadline
- Match score badge
- Quick actions: pindah status, buka detail, generate draft, skip

**Transitions:**
- Auto: `discovered → reviewing` setelah di-klik
- Manual: `reviewing → interested` by user
- Auto: `interested → preparing` saat mulai generate dokumen
- Manual: `preparing → submitted` (dengan upload bukti submit)
- Auto: `submitted → won/lost` berdasarkan pengumuman yang ter-crawl

---

### M7 — AI Document Drafter

**Tujuan**: generate dokumen penawaran berkualitas, siap edit manual.

**Document types MVP:**

| Dokumen | LLM | Template Base |
|---------|-----|---------------|
| Surat Penawaran Harga | Claude Sonnet | Template .docx dengan Jinja2-like vars |
| Surat Pernyataan Tidak Pailit | Claude Sonnet | Template static |
| Pakta Integritas | Claude Sonnet | Template static |
| Surat Dukungan | Claude Sonnet | Template + kustomisasi |
| Data Kualifikasi | Claude Sonnet | Form-fill dari company profile |
| Metodologi Pelaksanaan | Claude Sonnet | Generate dari scope of work |
| Jadwal Pelaksanaan | Gemini | Parse scope → timeline |
| Struktur Organisasi Proyek | Claude Sonnet | Pilih dari tim internal |

**Drafting pipeline:**

```
Tender (parsed) + Company Profile + Historical Projects
    │
    ▼
┌─────────────────────────────────────┐
│  Context Builder                    │
│  - Extract relevant company data    │
│  - Retrieve similar past projects   │
│    (Qdrant semantic search)         │
│  - Load document template           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  LLM Drafting                       │
│  - System prompt: role, style       │
│  - User prompt: context + task      │
│  - Output: structured markdown      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Rendering                          │
│  - Markdown → .docx (python-docx)   │
│  - Apply company letterhead         │
│  - Insert signature placeholder     │
└──────────────┬──────────────────────┘
               │
               ▼
         MinIO storage
```

**Contoh prompt untuk Metodologi Pelaksanaan:**

```text
Anda adalah Technical Proposal Writer berpengalaman di sektor {sektor}.

Tender:
- Judul: {title}
- Instansi: {instansi}
- Scope of Work: {scope_list}
- Durasi: {duration_days} hari
- Lokasi: {lokasi}

Profil Perusahaan:
- Nama: {company_name}
- Keahlian: {expertise_areas}
- Tim kunci: {key_personnel}

Proyek sejenis yang pernah dikerjakan:
{similar_projects_bullet}

Tulis "Metodologi Pelaksanaan" dalam format:
1. Pemahaman Lingkup Pekerjaan (1 paragraf)
2. Pendekatan & Metodologi (bullet + penjelasan per tahap)
3. Tahapan Pelaksanaan (mapping ke jadwal)
4. Manajemen Risiko (3-5 risiko utama + mitigasi)
5. Quality Assurance

Gaya: formal, teknis, konkret. Hindari buzzword tanpa substansi.
Panjang: 1500-2500 kata. Output markdown.
```

---

### M8 — Bid Package Generator (V2)

**Output**: ZIP file siap upload ke LPSE, struktur folder:

```
BidPackage_{tender_id}_{timestamp}.zip
├── 01_Administrasi/
│   ├── Surat_Penawaran.pdf
│   ├── Pakta_Integritas.pdf
│   ├── Surat_Pernyataan_Tidak_Pailit.pdf
│   └── Jaminan_Penawaran.pdf (placeholder, user upload manual)
├── 02_Teknis/
│   ├── Metodologi.pdf
│   ├── Jadwal_Pelaksanaan.pdf
│   ├── Struktur_Organisasi.pdf
│   ├── CV_Tenaga_Ahli/
│   │   ├── CV_[Nama1].pdf
│   │   └── CV_[Nama2].pdf
│   └── Pengalaman_Perusahaan.pdf
├── 03_Harga/
│   ├── Rincian_Harga_Penawaran.xlsx
│   └── Analisa_Harga_Satuan.xlsx (jika pekerjaan konstruksi)
├── 04_Kualifikasi/
│   ├── Data_Kualifikasi.pdf
│   ├── NIB.pdf
│   ├── NPWP.pdf
│   ├── Akta_Pendirian.pdf
│   └── Laporan_Keuangan_3Thn.pdf
└── README.txt (checklist apa yang sudah auto + apa yang butuh manual)
```

**Validation checklist** sebelum generate:
- Semua dokumen referenced ada & belum expire
- Signature tenaga ahli valid
- Harga penawaran sudah diisi
- Jaminan penawaran sudah di-arrange

---

### M9 — Market Intelligence Dashboard (V2)

**Analytics yang ingin ditampilkan:**

1. **HPS vs Winning Price**
   - Per KBLI, rata-rata % winning price dari HPS
   - Trend per tahun
   
2. **Competitor Tracking**
   - PT/CV apa yang sering ikut di KBLI kita
   - Win rate mereka, avg discount dari HPS
   - Pola: siapa sering menang di instansi mana
   
3. **Instansi Pattern**
   - Instansi X: avg paket size, frekuensi, metode pengadaan favorit
   - Kapan biasanya buka lelang (bulan rawan di APBN/APBD)
   
4. **Market Size**
   - Total nilai paket di KBLI kita per tahun
   - Geographic distribution
   
5. **Internal Performance**
   - Win rate perusahaan
   - Avg bid preparation time
   - Revenue pipeline (submitted tapi belum diumumkan)

**Data source**: seluruh tender yang ter-crawl (termasuk yang tidak kita ikuti) + pengumuman pemenang.

---

### M10 — Contract & Financial Tracker (V2)

**Setelah menang tender, data masuk ke modul ini:**

**Contract entity:**
```python
class Contract(BaseModel):
    id: UUID
    tender_id: UUID  # FK ke tender
    contract_number: str
    pihak_pertama: str  # Pemberi kerja
    pihak_kedua: str  # Kita
    nilai_kontrak: Decimal
    ppn: Decimal
    nilai_total: Decimal
    
    tanggal_kontrak: date
    tanggal_mulai: date
    tanggal_selesai: date
    masa_pemeliharaan_hari: int
    
    jaminan_pelaksanaan: Decimal
    retensi_persen: Decimal  # Biasanya 5%
    
    termin: list[Termin]
    amendments: list[Amendment]
    
    status: Literal["active", "completed", "terminated"]
```

**Termin (pembayaran bertahap):**
```python
class Termin(BaseModel):
    no: int
    deskripsi: str  # "Uang muka 20%", "Progress 50%", "Serah terima"
    persentase: Decimal
    nilai: Decimal
    syarat_pencairan: str  # "BAST fisik 50% + laporan"
    target_date: date
    actual_invoice_date: date | None
    actual_payment_date: date | None
    status: Literal["pending", "invoiced", "paid", "delayed"]
```

**Fitur:**
- Dashboard cashflow: projected vs actual per bulan
- Aging invoice: berapa invoice outstanding > 30/60/90 hari
- Reminder: termin yang sudah bisa ditagih
- Compliance: retensi yang sudah bisa dicairkan (setelah masa pemeliharaan)

---

### M11 — Compliance Calendar (V2)

**Event types:**
- NIB renewal
- SBU renewal (per kode)
- ISO renewal
- SPT Tahunan (April)
- SPT Masa PPh (tgl 10 setiap bulan), PPN (akhir bulan)
- Laporan kegiatan usaha (LKPM BKPM, triwulan)
- RUPS tahunan
- Laporan keuangan audit (kalau omzet > threshold)

**Features:**
- Calendar view
- Auto-reminder H-30, H-7, H-1
- Link ke dokumen terkait (di document vault)
- Checklist item (step-by-step, mis. SPT Tahunan: kumpul data, hitung, e-filing, bukti)

---

### M12 — Semantic Project Memory (V3)

**Tujuan**: saat lihat tender baru, sistem bisa retrieve "Anda pernah kerja yang mirip di tahun X dengan instansi Y, nilai Rp N, durasi D hari."

**Implementation:**
- Embed semua historical project (title + deskripsi + scope) ke Qdrant
- Embed tender baru
- Cosine similarity top-K
- Tampilkan di detail tender: "Proyek mirip yang pernah dikerjakan"
- Dipakai juga di drafting untuk reference

**Embedding model**: `text-embedding-3-small` (OpenAI) atau `embedding-001` (Gemini), keduanya 768–1536 dim.

---

### M13 — Regulatory Watch (V3)

**Sumber:**
- JDIH kementerian (Perpres, Permen, Perka LKPP)
- Peraturan.go.id
- Website LKPP news

**Workflow:**
- Crawl harian
- LLM classify: relevan PBJ? ya → ringkas → push notif
- Tag dengan dampak: "Affects: jaminan_penawaran", "Affects: usaha_kecil_threshold"

---

## 6. Data Model

### 6.1 PostgreSQL Tables

```sql
-- Company profile (singleton, id = 1)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(50),  -- PT, CV, UD
    npwp VARCHAR(30) UNIQUE,
    nib VARCHAR(30) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    modal_dasar NUMERIC(20,2),
    modal_disetor NUMERIC(20,2),
    kbli_codes TEXT[],  -- array
    established_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INT REFERENCES companies(id),
    type VARCHAR(50),  -- SBU, ISO, K3, etc
    code VARCHAR(100),
    grade VARCHAR(20),
    issuer VARCHAR(255),
    issued_date DATE,
    expire_date DATE,
    document_minio_key TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INT REFERENCES companies(id),
    full_name VARCHAR(255),
    position VARCHAR(100),
    education JSONB,  -- [{degree, institution, year}]
    certifications JSONB,
    experience JSONB,
    cv_minio_key TEXT,
    is_key_personnel BOOLEAN DEFAULT FALSE
);

CREATE TABLE portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INT REFERENCES companies(id),
    name VARCHAR(500),
    client VARCHAR(255),
    value NUMERIC(20,2),
    start_date DATE,
    end_date DATE,
    description TEXT,
    scope_of_work TEXT[],
    reference_contact VARCHAR(255),
    reference_document_minio_key TEXT,
    embedding_id UUID  -- ref to Qdrant point
);

-- Contracts (from won tenders)
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID,  -- loose ref to MongoDB tender._id
    contract_number VARCHAR(100),
    pihak_pertama VARCHAR(255),
    nilai_kontrak NUMERIC(20,2),
    ppn NUMERIC(20,2),
    nilai_total NUMERIC(20,2),
    tanggal_kontrak DATE,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    masa_pemeliharaan_hari INT,
    jaminan_pelaksanaan NUMERIC(20,2),
    retensi_persen NUMERIC(5,2) DEFAULT 5.0,
    status VARCHAR(20) DEFAULT 'active',
    document_minio_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE termin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id),
    no INT,
    deskripsi TEXT,
    persentase NUMERIC(5,2),
    nilai NUMERIC(20,2),
    syarat_pencairan TEXT,
    target_date DATE,
    actual_invoice_date DATE,
    actual_payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Compliance events
CREATE TABLE compliance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100),  -- spt_tahunan, sbu_renewal, etc
    title VARCHAR(255),
    due_date DATE NOT NULL,
    recurrence VARCHAR(20),  -- once, yearly, monthly, quarterly
    related_cert_id UUID REFERENCES certifications(id),
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- Users (multi-user future)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',  -- admin, estimator, viewer
    telegram_chat_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 MongoDB Collections

**`tenders`** — raw + parsed tender data (schema fleksibel karena beda sumber):

```javascript
{
  _id: ObjectId,
  source_id: "lpse_riau",
  source_tender_id: "12345678",
  url: "https://lpse.riau.go.id/...",
  
  // Raw
  raw_html: "...", // compressed
  raw_documents: [ // before parsing
    { name: "RKS.pdf", minio_key: "...", hash: "sha256..." }
  ],
  
  // Parsed structured
  title: "Pengadaan SIMRS RSUD X",
  instansi: "RSUD X Riau",
  hps: NumberDecimal("1840000000"),
  pagu: NumberDecimal("2000000000"),
  jenis_pengadaan: "jasa_lainnya",
  kbli_required: ["62010"],
  sbu_required: [{code: "SI004", grade: "M1"}],
  kualifikasi: "menengah",
  modal_min: NumberDecimal("500000000"),
  
  submission_deadline: ISODate("2026-05-20T15:00:00Z"),
  lokasi_pekerjaan: "Pekanbaru, Riau",
  
  ai_summary: "...",
  scope_of_work: ["...", "..."],
  risks_flags: [],
  
  match_score: 82.5,
  match_reasons: ["KBLI cocok", "Domisili sama", ...],
  eligibility: "eligible",
  missing_requirements: [],
  
  status: "interested",
  notes: "...",
  
  created_at: ISODate(),
  updated_at: ISODate(),
  last_crawled_at: ISODate()
}
```

**`tender_versions`** — addendum/perubahan tender:
```javascript
{
  _id: ObjectId,
  tender_id: ObjectId,
  version: 2,
  change_summary: "Perpanjangan deadline + perubahan spek",
  diff: { ... },
  created_at: ISODate()
}
```

**`draft_documents`** — hasil AI drafting:
```javascript
{
  _id: ObjectId,
  tender_id: ObjectId,
  document_type: "metodologi",
  content_markdown: "...",
  content_minio_key: "drafts/tender-xxx/metodologi-v1.docx",
  version: 1,
  generated_by: "claude-sonnet-4-6",
  generated_at: ISODate(),
  user_edited: false,
  approved: false
}
```

**`crawl_logs`** — audit log crawler:
```javascript
{
  _id: ObjectId,
  source_id: "lpse_riau",
  started_at: ISODate(),
  completed_at: ISODate(),
  status: "success", // success, partial, failed
  tenders_found: 42,
  tenders_new: 7,
  errors: []
}
```

### 6.3 Qdrant Collections

- **`portfolio_projects`**: embed CV Panda historical projects
- **`tenders_scope`**: embed scope_of_work tender (untuk similarity search)

---

## 7. Scraping Strategy

### 7.1 Per-Source Playbook

#### LPSE (Inaproc, daerah)

- **Entry**: `/eproc4/lelang` atau `/lelang`
- **Listing**: Tabel pagination, kolom: kode, nama, HPS, tahap, akhir pendaftaran
- **Detail**: klik kode → halaman detail berisi info + tab dokumen
- **Dokumen**: sebagian bisa download tanpa login, sebagian perlu login penyedia
- **Captcha**: biasanya di login, tidak di browse
- **Anti-block**: biasanya cukup longgar untuk browse publik

**Implementation note**: gunakan Playwright karena banyak state disimpan di session + pagination AJAX.

#### e-Proc PLN

- **Entry**: eproc.pln.co.id
- **Listing publik**: ada di halaman "Pengumuman Lelang" (tanpa login)
- **Detail**: perlu akses penyedia terdaftar untuk detail lengkap
- **Strategi**: scrape listing publik, simpan, untuk detail user klik link → buka Playwright context dengan session login penyedia

#### e-Proc Pertamina

- **Entry**: ptm-eproc.pertamina.com
- **Access**: vendor terdaftar (sudah ada akun Pertamina)
- **API**: tidak ada public API, scrape

### 7.2 Orchestration

**Celery Beat schedule:**

```python
CELERY_BEAT_SCHEDULE = {
    'crawl-lpse-nasional': {
        'task': 'tenders.crawl_source',
        'schedule': crontab(minute=0, hour='*/2'),
        'args': ('lpse_nasional',)
    },
    'crawl-lpse-riau': {
        'task': 'tenders.crawl_source',
        'schedule': crontab(minute=15, hour='*/1'),
        'args': ('lpse_riau',)
    },
    'crawl-eproc-pln': {
        'task': 'tenders.crawl_source',
        'schedule': crontab(minute=30, hour='*/3'),
        'args': ('eproc_pln',)
    },
    # ... per source
    'compliance-reminder-check': {
        'task': 'compliance.check_due',
        'schedule': crontab(minute=0, hour=7),  # daily 07:00
    },
    'daily-digest': {
        'task': 'notif.send_daily_digest',
        'schedule': crontab(minute=0, hour=8),
    },
    'weekly-summary': {
        'task': 'notif.send_weekly_summary',
        'schedule': crontab(minute=0, hour=7, day_of_week=1),  # Mon
    }
}
```

### 7.3 Error Handling

- Retry 3x dengan exponential backoff (5s, 30s, 5min)
- Jika gagal 3x → alert Telegram "Source {x} down"
- Circuit breaker: jika source gagal > 50% dalam 24 jam, pause 6 jam
- Selalu simpan raw HTML even jika parsing gagal — biar bisa re-parse belakangan

---

## 8. AI/LLM Integration

### 8.1 Model Allocation

| Use Case | Model | Alasan |
|----------|-------|--------|
| Bulk parsing RKS/KAK | Gemini 2.5 Flash | Murah, cukup untuk structured extract |
| Classification tender | Gemini 2.5 Flash | Cepat, task sederhana |
| Summary tender | Gemini 2.5 Flash | Bulk, cost-sensitive |
| Drafting surat/dokumen | Claude Sonnet 4.6 | Kualitas bahasa Indonesia formal superior |
| Drafting metodologi | Claude Sonnet 4.6 | Butuh reasoning & struktur |
| Regulatory interpretation | Claude Opus 4.7 | Kritis, butuh ketelitian |
| Embedding | Gemini `embedding-001` | Multilingual, Indonesian-aware |

### 8.2 LLM Gateway Pattern

```python
# app/services/llm_gateway.py

class LLMGateway:
    def __init__(self):
        self.gemini = GeminiClient(api_key=settings.GEMINI_API_KEY)
        self.anthropic = AnthropicClient(api_key=settings.ANTHROPIC_API_KEY)
    
    async def extract_structured(self, text: str, schema: dict) -> dict:
        """Cheap bulk extraction via Gemini."""
        return await self.gemini.generate_json(
            model="gemini-2.5-flash",
            prompt=build_extract_prompt(text, schema),
            response_schema=schema
        )
    
    async def draft_document(self, doc_type: str, context: dict) -> str:
        """High-quality drafting via Claude."""
        template = load_template(doc_type)
        return await self.anthropic.generate(
            model="claude-sonnet-4-6",
            system=template.system_prompt,
            messages=[{"role": "user", "content": template.format(**context)}],
            max_tokens=4000
        )
    
    async def embed(self, text: str) -> list[float]:
        return await self.gemini.embed(model="embedding-001", text=text)
```

### 8.3 Cost Control

- **Cache**: semua response LLM di-cache pakai Redis (key = hash(prompt + model))
- **Budget**: set monthly cap di env, throw error kalau exceeded
- **Tracking**: log tiap call (tokens in/out, cost, latency) ke MongoDB `llm_calls` collection
- **Fallback**: jika Claude rate-limited, fallback ke Gemini Pro untuk drafting (kualitas masih oke)

### 8.4 Prompt Templates

Simpan di `app/prompts/` sebagai file `.yaml`:

```yaml
# app/prompts/extract_tender.yaml
model: gemini-2.5-flash
system: |
  Anda adalah parser dokumen pengadaan Indonesia yang teliti.
user_template: |
  Ekstrak informasi dari dokumen pengadaan berikut:
  
  ---
  {document_text}
  ---
  
  Output JSON dengan schema:
  {schema_json}
  
  Aturan:
  - Null jika info tidak disebut eksplisit
  - Angka dalam rupiah tanpa pemisah
  - Tanggal format ISO 8601
response_format: json_object
```

---

## 9. Telegram Bot Interface

### 9.1 Bot Commands

```
/start           - Aktivasi bot & pairing user
/status          - Ringkasan hari ini (X tender baru, Y deadline)
/tenders         - List tender aktif (status = reviewing/interested/preparing)
/tender <id>     - Detail tender
/skip <id>       - Mark tender as ineligible
/interested <id> - Move to interested
/draft <id>      - Trigger AI drafting untuk tender
/deadlines       - List tender dengan deadline < 7 hari
/compliance      - Compliance events upcoming
/stats           - Dashboard stats (win rate, revenue pipeline)
/help            - Bantuan
```

### 9.2 Inline Keyboard Flow

**Notif tender baru:**
```
🆕 TENDER BARU — Match 87%

📋 Pengadaan SIMRS RSUD Petala Bumi
🏢 RSUD Petala Bumi (Pekanbaru)
💰 HPS: Rp 1.840.000.000
📅 Deadline: 20 Mei 2026 (30 hari lagi)
✅ KBLI 62010 ✓ SBU SI004 ✓ Domisili ✓

[🔍 Detail] [👍 Interested] [👎 Skip] [✍️ Draft]
```

Callback handler:
- `[Detail]` → kirim message panjang + tombol buka web
- `[Interested]` → update status + reply "✅ Added to pipeline"
- `[Draft]` → trigger Celery task, reply "⏳ Drafting..." → kirim file .docx saat selesai

### 9.3 Implementation

Library: `python-telegram-bot` v20+ (async).

```python
# app/bot/handlers.py
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

async def handle_interested(update, context):
    query = update.callback_query
    tender_id = query.data.split(':')[1]
    await tender_service.update_status(tender_id, 'interested')
    await query.answer("✅ Added to pipeline")
    await query.edit_message_reply_markup(None)
```

### 9.4 Auth

- Satu bot, satu user (Budi) di MVP
- Verifikasi `chat_id` harus match dengan `users.telegram_chat_id`
- Token bot di env var

---

## 10. Security & Compliance

### 10.1 Data Protection

- **Encryption at rest**: PostgreSQL & MongoDB dienkripsi di VPS (LUKS atau app-level untuk field sensitive seperti NPWP)
- **Encryption in transit**: HTTPS (Caddy auto), internal traffic via Docker network
- **Secrets**: `.env` file, jangan commit. Pakai `sops` atau `age` untuk encrypt production secrets.
- **Credential penyedia (LPSE, e-Proc)**: encrypted di DB dengan Fernet (symmetric key di env), jangan plaintext.

### 10.2 Audit Log

Semua action sensitive di-log:
- Login attempt
- Dokumen downloaded
- Draft generated
- Status tender berubah
- Export data

### 10.3 Legal Considerations

- **Scraping**: taati robots.txt untuk non-public endpoints. Scrape hanya info publik.
- **Data retention**: dokumen kontrak simpan min 10 tahun (standar bisnis)
- **Auto-submission**: **JANGAN** lakukan auto-submit sebelum ada konfirmasi user. Sistem = asisten, keputusan final = manusia.
- **Copyright dokumen pengadaan**: RKS/KAK adalah dokumen publik untuk tender terbuka, aman disimpan untuk internal.

### 10.4 Access Control (future multi-user)

Role-based:
- **Admin**: full access
- **Estimator**: lihat & edit tender, tidak bisa ubah company profile
- **Viewer**: read-only

---

## 11. Development Roadmap

### 11.1 Sprint Plan

**Phase 1 — Foundation (Week 1–2)**
- [ ] Setup monorepo (Turborepo)
- [ ] Docker Compose dev environment (Postgres, Mongo, Redis, MinIO, Qdrant)
- [ ] FastAPI skeleton + auth (JWT) + basic CRUD company profile
- [ ] Next.js skeleton + shadcn/ui + layout dashboard
- [ ] CI setup (GitHub Actions: lint + test)

**Phase 2 — Company Module (Week 3–4)**
- [ ] M1: Company profile CRUD (UI + API)
- [ ] Document upload to MinIO
- [ ] Certifications & expire tracking
- [ ] Personnel & portfolio CRUD
- [ ] Compliance calendar (read-only)

**Phase 3 — Crawler MVP (Week 5–7)**
- [ ] Base adapter + normalization
- [ ] LPSE Riau adapter (simplest untuk start)
- [ ] LPSE Nasional adapter
- [ ] MongoDB storage + dedup
- [ ] Celery scheduling
- [ ] Simple list UI di web

**Phase 4 — Parsing & Matching (Week 8–9)**
- [ ] PDF extraction pipeline (pdfplumber + OCR fallback)
- [ ] LLM gateway + Gemini parsing
- [ ] Matching engine (rule-based dulu, belum vector)
- [ ] Score display di UI

**Phase 5 — Notif & Pipeline (Week 10–11)**
- [ ] Telegram bot basic commands
- [ ] Notif push real-time
- [ ] Kanban pipeline UI
- [ ] Daily digest email

**Phase 6 — AI Drafter (Week 12)**
- [ ] Template system
- [ ] Claude integration for drafting
- [ ] Tiptap editor untuk edit hasil
- [ ] Export .docx

**MVP GOAL: end of Week 12** → bisa ditinggal auto crawl, notif, drafting.

**Phase 7+ (V2)** akan dibuat roadmap detail setelah MVP di-evaluasi dari pemakaian nyata.

### 11.2 Milestone Checkpoints

| Week | Checkpoint |
|------|-----------|
| 2 | Infra & auth jalan, bisa login |
| 4 | Company vault fully functional |
| 7 | 2 source crawler jalan otomatis, data masuk DB |
| 9 | Matching engine scoring tender benar |
| 11 | Telegram notif received real tender |
| 12 | End-to-end: crawl → parse → match → notif → draft → export |

---

## 12. Project Structure

### 12.1 Monorepo Layout

```
tendermind/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── api/                      # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── config.py
│   │   │   ├── core/
│   │   │   │   ├── security.py
│   │   │   │   ├── database.py
│   │   │   │   └── dependencies.py
│   │   │   ├── models/           # SQLAlchemy + Beanie
│   │   │   │   ├── sql/
│   │   │   │   │   ├── company.py
│   │   │   │   │   ├── contract.py
│   │   │   │   │   └── ...
│   │   │   │   └── mongo/
│   │   │   │       ├── tender.py
│   │   │   │       └── ...
│   │   │   ├── schemas/          # Pydantic
│   │   │   ├── api/              # Route handlers
│   │   │   │   ├── v1/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── company.py
│   │   │   │   │   ├── tenders.py
│   │   │   │   │   ├── contracts.py
│   │   │   │   │   └── ...
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── tender_service.py
│   │   │   │   ├── matching_service.py
│   │   │   │   ├── drafting_service.py
│   │   │   │   ├── llm_gateway.py
│   │   │   │   └── notif_service.py
│   │   │   ├── scrapers/         # Source adapters
│   │   │   │   ├── base.py
│   │   │   │   ├── lpse/
│   │   │   │   │   ├── nasional.py
│   │   │   │   │   └── riau.py
│   │   │   │   └── eproc/
│   │   │   │       ├── pln.py
│   │   │   │       └── pertamina.py
│   │   │   ├── workers/          # Celery tasks
│   │   │   │   ├── celery_app.py
│   │   │   │   ├── tender_tasks.py
│   │   │   │   ├── notif_tasks.py
│   │   │   │   └── compliance_tasks.py
│   │   │   ├── prompts/          # LLM prompts
│   │   │   │   ├── extract_tender.yaml
│   │   │   │   ├── draft_surat_penawaran.yaml
│   │   │   │   └── ...
│   │   │   ├── templates/        # .docx templates
│   │   │   │   ├── surat_penawaran.docx
│   │   │   │   └── ...
│   │   │   └── bot/              # Telegram bot
│   │   │       ├── bot.py
│   │   │       └── handlers.py
│   │   ├── tests/
│   │   ├── alembic/              # DB migrations
│   │   ├── pyproject.toml
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── web/                      # Next.js frontend
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login/
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx            # Home dashboard
│       │   │   ├── tenders/
│       │   │   │   ├── page.tsx        # Pipeline kanban
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx    # Detail
│       │   │   ├── company/
│       │   │   │   ├── profile/
│       │   │   │   ├── documents/
│       │   │   │   ├── personnel/
│       │   │   │   └── portfolio/
│       │   │   ├── contracts/
│       │   │   ├── compliance/
│       │   │   └── intelligence/
│       │   └── api/                    # Next.js API routes (proxy)
│       ├── components/
│       │   ├── ui/                     # shadcn/ui
│       │   ├── tender/
│       │   ├── company/
│       │   └── shared/
│       ├── lib/
│       │   ├── api-client.ts
│       │   ├── utils.ts
│       │   └── hooks/
│       ├── stores/                     # Zustand
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── Dockerfile
│
├── packages/                     # Shared (types, configs)
│   ├── types/                    # Shared TS types (generated from OpenAPI)
│   └── configs/
│       ├── eslint/
│       └── tsconfig/
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── Caddyfile
│   └── scripts/
│       ├── backup.sh
│       └── restore.sh
│
├── docs/
│   ├── BLUEPRINT.md              # this file
│   ├── API.md
│   ├── SCRAPER_GUIDE.md
│   ├── PROMPT_GUIDE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
├── turbo.json
└── package.json
```

### 12.2 Database Migrations

- **PostgreSQL**: Alembic (auto-generate dari SQLAlchemy models)
- **MongoDB**: manual migration scripts di `apps/api/migrations/mongo/` (numbered)
- **Qdrant**: collection setup di startup hook

---

## 13. Environment Variables

**`apps/api/.env.example`:**

```bash
# App
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=change_me
APP_CORS_ORIGINS=http://localhost:3000

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=tendermind
POSTGRES_PASSWORD=change_me
POSTGRES_DB=tendermind

MONGO_URI=mongodb://mongo:27017
MONGO_DB=tendermind

REDIS_URL=redis://redis:6379/0

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=change_me
MINIO_BUCKET=tendermind
MINIO_SECURE=false

# Qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=

# LLM
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
LLM_MONTHLY_BUDGET_USD=50

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=

# Email (Resend/Zoho)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=tendermind@pandaglobal.tech

# Scraper
SCRAPER_USER_AGENT=TenderMind/1.0
SCRAPER_PROXY_URL=
TWOCAPTCHA_API_KEY=

# External creds (encrypted in DB, but seed via env for dev)
LPSE_PENYEDIA_USERNAME=
LPSE_PENYEDIA_PASSWORD=
EPROC_PLN_USERNAME=
EPROC_PLN_PASSWORD=

# Encryption
FERNET_KEY=  # generate via: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**`apps/web/.env.example`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 14. Deployment

### 14.1 Development

```bash
# 1. Clone
git clone https://github.com/<user>/tendermind.git
cd tendermind

# 2. Setup env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Fill in API keys

# 3. Start infra
docker compose up -d postgres mongo redis minio qdrant

# 4. Install deps
cd apps/api && pip install -e . && alembic upgrade head
cd ../web && pnpm install

# 5. Run
# Terminal 1: API
cd apps/api && uvicorn app.main:app --reload

# Terminal 2: Celery worker
cd apps/api && celery -A app.workers.celery_app worker --loglevel=info

# Terminal 3: Celery beat
cd apps/api && celery -A app.workers.celery_app beat --loglevel=info

# Terminal 4: Web
cd apps/web && pnpm dev

# Terminal 5: Bot
cd apps/api && python -m app.bot.bot
```

### 14.2 Production (Single VPS)

**Spec minimum**: 4 vCPU, 8GB RAM, 160GB SSD, Ubuntu 24.04 LTS.

**Topology:**
```
Internet → Caddy (443) → {
  /          → Next.js (web:3000)
  /api       → FastAPI (api:8000)
  /ws        → FastAPI (api:8000)
}

Internal docker network:
- postgres:5432
- mongo:27017
- redis:6379
- minio:9000
- qdrant:6333
- celery-worker, celery-beat, telegram-bot (no exposed port)
```

**docker-compose.prod.yml** (skeleton):
```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile, caddy_data:/data]
  
  web:
    build: ../apps/web
    environment: {NEXT_PUBLIC_API_URL: https://tendermind.local}
  
  api:
    build: ../apps/api
    env_file: ../apps/api/.env
    depends_on: [postgres, mongo, redis, minio, qdrant]
  
  celery-worker:
    build: ../apps/api
    command: celery -A app.workers.celery_app worker --concurrency=4
    env_file: ../apps/api/.env
    depends_on: [redis]
  
  celery-beat:
    build: ../apps/api
    command: celery -A app.workers.celery_app beat
    env_file: ../apps/api/.env
  
  telegram-bot:
    build: ../apps/api
    command: python -m app.bot.bot
    env_file: ../apps/api/.env
  
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_USER: ..., POSTGRES_DB: ...}
    volumes: [pg_data:/var/lib/postgresql/data]
  
  mongo:
    image: mongo:7
    volumes: [mongo_data:/data/db]
  
  redis:
    image: redis:7-alpine
  
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes: [minio_data:/data]
  
  qdrant:
    image: qdrant/qdrant
    volumes: [qdrant_data:/qdrant/storage]

volumes:
  caddy_data: {}
  pg_data: {}
  mongo_data: {}
  minio_data: {}
  qdrant_data: {}
```

### 14.3 Backup Strategy

Daily automated backup via cron:
- PostgreSQL: `pg_dump` → gzip → upload ke S3/Wasabi
- MongoDB: `mongodump` → gzip → upload
- MinIO: rclone sync ke bucket backup
- Retention: 7 daily, 4 weekly, 12 monthly

---

## 15. Claude Code Usage Notes

### 15.1 Rekomendasi Workflow di Claude Code

**Start session dengan:**
1. `git clone` repo kosong
2. Copy `BLUEPRINT.md` ini ke `docs/BLUEPRINT.md`
3. Tambahkan `CLAUDE.md` di root (konteks untuk Claude Code)
4. Mulai dengan `"Baca docs/BLUEPRINT.md lalu implementasi Phase 1 step by step"`

### 15.2 CLAUDE.md (template isi)

```markdown
# TenderMind — Claude Code Context

## Project
Internal tender automation untuk CV Panda Global Teknologi.
Full blueprint: `docs/BLUEPRINT.md` — baca dulu sebelum coding.

## Conventions
- Python: FastAPI + async-first. Pakai `async def`, `await`, `AsyncSession`.
- TypeScript: strict mode. No `any`. Pakai Zod untuk runtime validation.
- Commits: conventional commits (feat:, fix:, chore:, docs:, refactor:)
- Branches: feature/XXX, fix/XXX
- Tests: pytest untuk API, vitest untuk web. Minimum coverage di service layer 70%.

## Design Principles
1. **Scraping adapter pattern**: tiap source = 1 class inherit dari BaseSourceAdapter
2. **LLM calls selalu via LLMGateway**, bukan panggil SDK langsung
3. **Celery task idempotent**: bisa re-run tanpa side effect
4. **Secrets never hardcoded**: always via env or DB (encrypted)
5. **Logging structured**: pakai structlog, log context sebagai key-value

## Current Phase
Phase 1 — Foundation. Focus: infra + auth + skeleton.

## Do Not
- Jangan buat auto-submit ke LPSE (legal risk)
- Jangan commit .env atau file dengan API key
- Jangan hardcode HPS, KBLI, atau data spesifik perusahaan — selalu fetch dari DB
- Jangan skip type hints di Python
```

### 15.3 Task Breakdown Contoh

Minta Claude Code breakdown task per module, contoh:

```
Mulai implementasi M1 (Company Profile & Document Vault).
Breakdown dulu jadi sub-task concrete, saya review, baru lanjut coding.
Output yang saya harapkan:
1. SQLAlchemy models
2. Alembic migration
3. Pydantic schemas
4. API endpoints (CRUD)
5. MinIO service wrapper untuk upload
6. Tests untuk setiap endpoint
7. Next.js page + form (shadcn/ui)
```

### 15.4 Review Checkpoint

Setelah tiap module selesai, minta Claude Code:
- Jalankan semua test
- Linting (ruff, eslint)
- Type check (mypy, tsc --noEmit)
- Update OpenAPI spec (auto dari FastAPI)
- Generate TS types dari OpenAPI ke `packages/types`

---

## Appendix A — Sample Prompt for Bid Drafting

```yaml
# app/prompts/draft_surat_penawaran.yaml
name: draft_surat_penawaran
model: claude-sonnet-4-6
max_tokens: 3000

system: |
  Anda adalah Corporate Secretary ahli dokumen pengadaan Indonesia.
  Tulis dokumen formal sesuai konvensi bisnis Indonesia.
  Bahasa: formal, lugas, tidak bertele-tele.
  Format: sesuai template standar surat penawaran.

user_template: |
  Buat SURAT PENAWARAN HARGA untuk tender berikut.
  
  === INFO TENDER ===
  Nomor Pengadaan: {tender.source_tender_id}
  Judul: {tender.title}
  Instansi: {tender.instansi}
  HPS: Rp {tender.hps_formatted}
  Tanggal Dokumen: {today}
  
  === PENAWARAN KITA ===
  Nilai Penawaran: Rp {penawaran_nilai}
  Masa Berlaku: {masa_berlaku} hari kalender
  Masa Pelaksanaan: {masa_pelaksanaan} hari kalender
  
  === PROFIL KITA ===
  Nama: {company.name}
  Alamat: {company.address}
  NPWP: {company.npwp}
  Direktur: {company.director_name}
  
  Output format: markdown dengan struktur:
  - Kop surat (Nama PT, alamat, no. surat, tanggal)
  - Tujuan (Kepada Yth + instansi + alamat)
  - Perihal
  - Pembukaan
  - Paragraf penawaran (sebutkan nomor lelang, nilai, kelengkapan dokumen)
  - Paragraf penutup
  - Tanda tangan (nama direktur + jabatan)
  
  Hindari template boilerplate generik. Sesuaikan dengan konteks tender spesifik.
```

---

## Appendix B — KBLI References untuk CV Panda Global Teknologi

> **Action item**: isi sendiri saat setup company profile. Beberapa yang umum untuk IT:

| KBLI | Deskripsi |
|------|-----------|
| 62010 | Aktivitas Pemrograman Komputer |
| 62020 | Aktivitas Konsultasi Komputer |
| 62090 | Aktivitas Teknologi Informasi dan Jasa Komputer Lainnya |
| 63111 | Aktivitas Pengolahan Data |
| 63112 | Aktivitas Hosting dan YBDI |
| 63122 | Portal Web dan/atau Platform Digital dengan Tujuan Komersial |
| 85499 | Jenis Pendidikan Lainnya Swasta YTDL (training) |

---

## Appendix C — Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| LPSE ubah struktur HTML, crawler break | High | Monitoring scheduled health-check, alert Telegram, raw HTML selalu disimpan untuk re-parse |
| LLM API cost membengkak | Medium | Cache aggresif, monthly budget cap, fallback model |
| False positive matching (tender tidak cocok diklaim cocok) | Medium | Conservative scoring, user feedback loop untuk retrain threshold |
| Data leak company profile/kontrak | Critical | Encryption at rest, access log, 2FA untuk admin |
| VPS down saat deadline kritis | High | Daily backup offsite, Uptime monitor (UptimeRobot), notif Telegram |
| Dependensi LPSE creds terblokir | Medium | Multi-account rotation, gunakan hanya untuk view, bukan bid |

---

**Document version**: 1.0
**Last updated**: 19 April 2026
**Owner**: Budi (CV Panda Global Teknologi)
**License**: Proprietary — Internal Use Only
