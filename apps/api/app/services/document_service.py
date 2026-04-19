from __future__ import annotations

from datetime import date
from pathlib import Path

from fastapi import UploadFile

from app.models.sql.document import CompanyDocument
from app.repositories.document_repository import CompanyDocumentRepository
from app.schemas.document import (
    CompanyDocumentDeleteResponse,
    CompanyDocumentListResponse,
    CompanyDocumentRead,
    CompanyDocumentSummary,
)
from app.services.document_storage import DocumentStorageService


class DocumentNotFoundError(RuntimeError):
    pass


class CompanyDocumentService:
    def __init__(self, repository: CompanyDocumentRepository, storage: DocumentStorageService) -> None:
        self.repository = repository
        self.storage = storage

    async def list_documents(self) -> CompanyDocumentListResponse:
        items = [self._serialize(item) for item in self.repository.list_all()]
        summary = CompanyDocumentSummary(
            total_documents=len(items),
            expiring_soon=sum(1 for item in items if item.status == "expiring_soon"),
            expired=sum(1 for item in items if item.status == "expired"),
        )
        return CompanyDocumentListResponse(summary=summary, items=items)

    async def upload_document(
        self,
        *,
        title: str,
        category: str,
        notes: str | None,
        expires_at: date | None,
        file: UploadFile,
    ) -> CompanyDocumentRead:
        stored = await self.storage.save_upload(file)
        document = self.repository.create(
            {
                "title": title,
                "category": category,
                "notes": notes,
                "expires_at": expires_at,
                **stored,
            }
        )
        return self._serialize(document)

    async def delete_document(self, document_id: int) -> CompanyDocumentDeleteResponse:
        document = self.repository.get_by_id(document_id)
        if document is None:
            raise DocumentNotFoundError("Document not found.")

        self.storage.delete_file(document.file_path)
        self.repository.delete(document)
        return CompanyDocumentDeleteResponse()

    async def get_download_path(self, document_id: int) -> tuple[Path, str]:
        document = self.repository.get_by_id(document_id)
        if document is None:
            raise DocumentNotFoundError("Document not found.")

        return Path(document.file_path), document.original_filename

    def _serialize(self, document: CompanyDocument) -> CompanyDocumentRead:
        days_until_expiry: int | None = None
        status = "active"

        if document.expires_at:
            days_until_expiry = (document.expires_at - date.today()).days
            if days_until_expiry < 0:
                status = "expired"
            elif days_until_expiry <= 30:
                status = "expiring_soon"

        return CompanyDocumentRead(
            id=document.id,
            title=document.title,
            category=document.category,
            notes=document.notes,
            original_filename=document.original_filename,
            mime_type=document.mime_type,
            size_bytes=document.size_bytes,
            expires_at=document.expires_at,
            created_at=document.created_at,
            updated_at=document.updated_at,
            status=status,
            days_until_expiry=days_until_expiry,
        )
