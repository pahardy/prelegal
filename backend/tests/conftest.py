import pytest
from fastapi.testclient import TestClient

from app import db
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    """A test client backed by a fresh temporary database."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    with TestClient(app) as c:
        yield c


def sign_up(client, email="a@example.com", password="password123"):
    """Register and sign in; the client keeps the session cookie."""
    return client.post("/api/auth/signup", json={"email": email, "password": password})
