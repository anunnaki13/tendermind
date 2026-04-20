from __future__ import annotations

from datetime import date

from app.models.sql.company import Company
from app.models.sql.draft import DraftRecord
from app.models.sql.document import CompanyDocument
from app.repositories.company_repository import CompanyRepository
from app.repositories.draft_repository import DraftRepository
from app.repositories.document_repository import CompanyDocumentRepository
from app.schemas.drafting import DraftGenerateRequest, DraftGenerateResponse, DraftHistoryItem, DraftHistoryResponse
from app.services.llm_gateway import LLMGateway


class DraftingService:
    def __init__(
        self,
        company_repository: CompanyRepository,
        draft_repository: DraftRepository,
        document_repository: CompanyDocumentRepository,
        llm_gateway: LLMGateway,
    ) -> None:
        self.company_repository = company_repository
        self.draft_repository = draft_repository
        self.document_repository = document_repository
        self.llm_gateway = llm_gateway

    async def generate_draft(self, payload: DraftGenerateRequest, current_user_email: str) -> DraftGenerateResponse:
        company = self.company_repository.get_singleton()
        documents = self.document_repository.list_all()
        supporting_documents = self._select_supporting_documents(documents)

        system_prompt = self._build_system_prompt()
        prompt = self._build_user_prompt(payload, company, supporting_documents)
        llm_response = await self.llm_gateway.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
            model=self.llm_gateway.settings.openrouter_drafter_model,
            temperature=0.25,
            max_tokens=payload.max_tokens,
        )
        record = self.draft_repository.create(
            {
                "document_type": payload.document_type,
                "tender_title": payload.tender_title,
                "tender_agency": payload.tender_agency,
                "scope_of_work": payload.scope_of_work,
                "evaluation_focus": payload.evaluation_focus,
                "notes": payload.notes,
                "tone": payload.tone,
                "model_name": llm_response.model,
                "content": llm_response.content,
                "prompt_tokens": llm_response.prompt_tokens,
                "completion_tokens": llm_response.completion_tokens,
                "total_tokens": llm_response.total_tokens,
                "supporting_documents": "\n".join(item.title for item in supporting_documents),
                "created_by_email": current_user_email,
            }
        )

        return DraftGenerateResponse(
            draft_id=record.id,
            model=llm_response.model,
            content=llm_response.content,
            supporting_documents=[item.title for item in supporting_documents],
            company_name=company.name if company else None,
            created_at=record.created_at,
            prompt_tokens=llm_response.prompt_tokens,
            completion_tokens=llm_response.completion_tokens,
            total_tokens=llm_response.total_tokens,
        )

    async def list_history(self) -> DraftHistoryResponse:
        items = [self._serialize_history(item) for item in self.draft_repository.list_recent()]
        return DraftHistoryResponse(items=items)

    def _build_system_prompt(self) -> str:
        return (
            "You are a senior bid manager and proposal writer for an Indonesian company. "
            "Write in polished Bahasa Indonesia, with a clean professional tone suitable for management review. "
            "Use only the provided context, avoid inventing certifications, licenses, or numbers. "
            "If data is missing, state assumptions conservatively. "
            "Return Markdown with clear section headings, concise bullets where useful, and action-oriented wording."
        )

    def _build_user_prompt(
        self,
        payload: DraftGenerateRequest,
        company: Company | None,
        supporting_documents: list[CompanyDocument],
    ) -> str:
        company_context = self._format_company_context(company)
        document_context = self._format_document_context(supporting_documents)

        return f"""
Susun draft {payload.document_type} untuk kebutuhan tender/internal bid response.

Tender:
- Judul: {payload.tender_title}
- Instansi/Pemberi Kerja: {payload.tender_agency}
- Gaya bahasa: {payload.tone}

Lingkup pekerjaan:
{payload.scope_of_work}

Fokus evaluasi:
{payload.evaluation_focus or "Belum disebutkan secara spesifik."}

Catatan tambahan:
{payload.notes or "Tidak ada catatan tambahan."}

Profil perusahaan:
{company_context}

Dokumen pendukung yang tersedia:
{document_context}

Output yang diminta:
- Ringkasan eksekutif singkat
- Pemahaman kebutuhan proyek
- Kesesuaian perusahaan dan kapabilitas utama
- Pendekatan pelaksanaan / metodologi kerja
- Risiko utama dan mitigasi singkat
- Dokumen pendukung yang sebaiknya dilampirkan
- Penutup yang meyakinkan namun tetap realistis

Pastikan hasilnya siap menjadi draft awal yang bisa disunting tim internal.
""".strip()

    def _format_company_context(self, company: Company | None) -> str:
        if company is None:
            return "Profil perusahaan belum dilengkapi."

        lines = [
            f"- Nama perusahaan: {company.name}",
            f"- Bentuk usaha: {company.legal_form or '-'}",
            f"- Kota/Provinsi: {company.city or '-'} / {company.province or '-'}",
            f"- NPWP: {company.npwp or '-'}",
            f"- NIB: {company.nib or '-'}",
            f"- Alamat: {company.address or '-'}",
            f"- KBLI: {company.kbli_codes or '-'}",
        ]
        if company.modal_dasar is not None:
            lines.append(f"- Modal dasar: Rp {company.modal_dasar:,.0f}")
        if company.modal_disetor is not None:
            lines.append(f"- Modal disetor: Rp {company.modal_disetor:,.0f}")
        return "\n".join(lines)

    def _select_supporting_documents(self, documents: list[CompanyDocument]) -> list[CompanyDocument]:
        active_first = sorted(
            documents,
            key=lambda item: (
                self._document_priority(item),
                item.expires_at or date.max,
                -item.id,
            ),
        )
        return active_first[:6]

    def _document_priority(self, document: CompanyDocument) -> int:
        if document.expires_at is None:
            return 0
        days_until_expiry = (document.expires_at - date.today()).days
        if days_until_expiry < 0:
            return 3
        if days_until_expiry <= 30:
            return 1
        return 0

    def _format_document_context(self, documents: list[CompanyDocument]) -> str:
        if not documents:
            return "- Belum ada dokumen pada vault."

        lines: list[str] = []
        for item in documents:
            expires_text = item.expires_at.isoformat() if item.expires_at else "tidak dicatat"
            lines.append(
                f"- {item.title} | kategori {item.category} | file {item.original_filename} | kedaluwarsa {expires_text}"
            )
        return "\n".join(lines)

    def _serialize_history(self, item: DraftRecord) -> DraftHistoryItem:
        supporting_documents = [part for part in item.supporting_documents.split("\n") if part]
        preview = item.content[:280].strip()
        if len(item.content) > 280:
            preview = f"{preview}..."

        return DraftHistoryItem(
            id=item.id,
            document_type=item.document_type,
            tender_title=item.tender_title,
            tender_agency=item.tender_agency,
            tone=item.tone,
            model_name=item.model_name,
            supporting_documents=supporting_documents,
            created_by_email=item.created_by_email,
            created_at=item.created_at,
            total_tokens=item.total_tokens,
            content_preview=preview,
        )
