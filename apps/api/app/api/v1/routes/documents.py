from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.core.dependencies import get_document_service
from app.schemas.document import CompanyDocumentDeleteResponse, CompanyDocumentListResponse, CompanyDocumentRead
from app.services.document_service import CompanyDocumentService, DocumentNotFoundError

router = APIRouter()


@router.get("", response_model=CompanyDocumentListResponse)
async def list_documents(
    service: CompanyDocumentService = Depends(get_document_service),
) -> CompanyDocumentListResponse:
    return await service.list_documents()


@router.post("/upload", response_model=CompanyDocumentRead)
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    notes: str | None = Form(default=None),
    expires_at: date | None = Form(default=None),
    file: UploadFile = File(...),
    service: CompanyDocumentService = Depends(get_document_service),
) -> CompanyDocumentRead:
    return await service.upload_document(
        title=title,
        category=category,
        notes=notes,
        expires_at=expires_at,
        file=file,
    )


@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    service: CompanyDocumentService = Depends(get_document_service),
) -> FileResponse:
    try:
        path, filename = await service.get_download_path(document_id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return FileResponse(path=path, filename=filename)


@router.delete("/{document_id}", response_model=CompanyDocumentDeleteResponse)
async def delete_document(
    document_id: int,
    service: CompanyDocumentService = Depends(get_document_service),
) -> CompanyDocumentDeleteResponse:
    try:
        return await service.delete_document(document_id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
