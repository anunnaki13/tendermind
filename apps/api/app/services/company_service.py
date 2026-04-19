from app.models.sql.company import Company
from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyProfileRead, CompanyProfileUpsert


class CompanyService:
    def __init__(self, repository: CompanyRepository) -> None:
        self.repository = repository

    async def get_profile(self) -> CompanyProfileRead:
        company = self.repository.get_singleton()
        if company is None:
            company = self.repository.create(self._default_payload())
        return self._serialize(company)

    async def upsert_profile(self, payload: CompanyProfileUpsert) -> CompanyProfileRead:
        company = self.repository.get_singleton()
        data = self._to_record(payload)
        if company is None:
            company = self.repository.create(data)
        else:
            company = self.repository.update(company, data)
        return self._serialize(company)

    def _default_payload(self) -> dict[str, object]:
        return {
            "name": "CV Panda Global Teknologi",
            "legal_form": "CV",
            "city": "Pekanbaru",
            "province": "Riau",
            "kbli_codes": "62010,62090",
        }

    def _to_record(self, payload: CompanyProfileUpsert) -> dict[str, object]:
        data = payload.model_dump()
        data["kbli_codes"] = ",".join(payload.kbli_codes)
        return data

    def _serialize(self, company: Company) -> CompanyProfileRead:
        return CompanyProfileRead.model_validate(
            {
                "id": company.id,
                "name": company.name,
                "legal_form": company.legal_form,
                "npwp": company.npwp,
                "nib": company.nib,
                "address": company.address,
                "city": company.city,
                "province": company.province,
                "modal_dasar": company.modal_dasar,
                "modal_disetor": company.modal_disetor,
                "kbli_codes": [item for item in company.kbli_codes.split(",") if item],
                "created_at": company.created_at,
                "updated_at": company.updated_at,
            }
        )
