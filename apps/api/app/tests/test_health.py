from fastapi.testclient import TestClient

from app.main import app


def test_healthcheck_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_company_profile_bootstraps_default_record() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/company/profile")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CV Panda Global Teknologi"
    assert data["kbli_codes"] == ["62010", "62090"]


def test_llm_status_reports_openrouter_configuration_shape() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/llm/status")

    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "openrouter"
    assert "base_url" in data


def test_documents_endpoint_returns_summary_shape() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/company/documents")

    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "items" in data
