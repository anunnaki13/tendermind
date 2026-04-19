from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import get_settings


class DocumentStorageService:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_path = Path(settings.documents_storage_dir).resolve()
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> dict[str, object]:
        suffix = Path(file.filename or "").suffix
        stored_filename = f"{uuid4().hex}{suffix}"
        destination = self.base_path / stored_filename

        content = await file.read()
        destination.write_bytes(content)

        return {
            "original_filename": file.filename or stored_filename,
            "stored_filename": stored_filename,
            "file_path": str(destination),
            "mime_type": file.content_type,
            "size_bytes": len(content),
        }

    def delete_file(self, file_path: str) -> None:
        path = Path(file_path)
        if path.exists():
            path.unlink()
