"""
Integration tests for auth and documents endpoints.
Run with: pytest backend/tests/test_auth_and_documents.py -v
"""
import os
import sys
import tempfile
import pytest

# Point to a temp DB so tests don't pollute the real one
os.environ["DB_PATH"] = tempfile.mktemp(suffix=".db")

# Make sure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

init_db()
client = TestClient(app)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def test_register_success():
    res = client.post("/api/auth/register", json={"email": "alice@test.com", "password": "secret123"})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["email"] == "alice@test.com"


def test_register_duplicate_email():
    client.post("/api/auth/register", json={"email": "dup@test.com", "password": "password1"})
    res = client.post("/api/auth/register", json={"email": "dup@test.com", "password": "password1"})
    assert res.status_code == 409


def test_register_short_password():
    res = client.post("/api/auth/register", json={"email": "short@test.com", "password": "tiny"})
    assert res.status_code == 400


def test_login_success():
    client.post("/api/auth/register", json={"email": "bob@test.com", "password": "bobpass1"})
    res = client.post("/api/auth/login", json={"email": "bob@test.com", "password": "bobpass1"})
    assert res.status_code == 200
    assert "token" in res.json()


def test_login_wrong_password():
    client.post("/api/auth/register", json={"email": "carol@test.com", "password": "correctpass"})
    res = client.post("/api/auth/login", json={"email": "carol@test.com", "password": "wrongpass"})
    assert res.status_code == 401


def test_login_unknown_email():
    res = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "anything"})
    assert res.status_code == 401


def test_protected_without_token():
    res = client.get("/api/documents")
    assert res.status_code == 403


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def auth_headers():
    res = client.post("/api/auth/register", json={"email": "docuser@test.com", "password": "docpass1"})
    if res.status_code == 409:
        res = client.post("/api/auth/login", json={"email": "docuser@test.com", "password": "docpass1"})
    token = res.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_documents_empty(auth_headers):
    res = client.get("/api/documents", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_save_and_retrieve_document(auth_headers):
    payload = {
        "document_type": "Mutual NDA",
        "title": "Test NDA",
        "fields": {"party1Name": "Acme Corp", "party2Name": "Globex"},
    }
    res = client.post("/api/documents", json=payload, headers=auth_headers)
    assert res.status_code == 201
    doc = res.json()
    assert doc["document_type"] == "Mutual NDA"
    assert doc["fields"]["party1Name"] == "Acme Corp"
    doc_id = doc["id"]

    # List shows it
    list_res = client.get("/api/documents", headers=auth_headers)
    assert any(d["id"] == doc_id for d in list_res.json())

    # Get by ID
    get_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["fields"]["party2Name"] == "Globex"


def test_delete_document(auth_headers):
    res = client.post("/api/documents", json={
        "document_type": "Pilot Agreement",
        "title": "Delete me",
        "fields": {"provider": "Acme"},
    }, headers=auth_headers)
    doc_id = res.json()["id"]

    del_res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_res.status_code == 204

    get_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == 404


def test_cannot_access_other_users_document(auth_headers):
    # Create doc as docuser
    res = client.post("/api/documents", json={
        "document_type": "Mutual NDA",
        "title": "Private doc",
        "fields": {"party1Name": "Me"},
    }, headers=auth_headers)
    doc_id = res.json()["id"]

    # Register a different user
    other = client.post("/api/auth/register", json={"email": "other@test.com", "password": "otherpass1"})
    other_headers = {"Authorization": f"Bearer {other.json()['token']}"}

    # Other user should get 404 (not their doc)
    get_res = client.get(f"/api/documents/{doc_id}", headers=other_headers)
    assert get_res.status_code == 404
