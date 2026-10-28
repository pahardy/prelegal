import sqlite3

from fastapi.testclient import TestClient

from app import db


def test_health_and_fresh_users_table(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    from app.main import app

    with TestClient(app) as client:
        assert client.get("/api/health").json() == {"status": "ok"}
        with sqlite3.connect(db.DB_PATH) as conn:
            conn.execute("INSERT INTO users (email, password_hash) VALUES ('a@b.c', 'x')")

    with TestClient(app) as client:
        with sqlite3.connect(db.DB_PATH) as conn:
            assert conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0


def test_merge_applies_only_non_null_updates():
    from app.chat import NdaUpdates, NdaValues, merge

    updates = NdaUpdates(
        purpose=None, effectiveDate="2026-11-01", mndaTermYears=None, mndaUntilTerminated=True,
        confidentialityYears=3, confidentialityPerpetual=None, governingLaw="Delaware",
        jurisdiction=None, modifications=None,
    )
    merged = merge(NdaValues(jurisdiction="Kept"), updates)
    assert merged.effectiveDate == "2026-11-01"
    assert merged.mndaTermYears is None
    assert merged.confidentialityYears == 3
    assert merged.governingLaw == "Delaware"
    assert merged.jurisdiction == "Kept"


NO_NDA_UPDATES = {
    "purpose": None, "effectiveDate": None, "mndaTermYears": None, "mndaUntilTerminated": None,
    "confidentialityYears": None, "confidentialityPerpetual": None, "governingLaw": None,
    "jurisdiction": None, "modifications": None,
}


def post_chat(tmp_path, monkeypatch, turn, body):
    """Post to /api/chat with the model mocked to return `turn`."""
    import json
    from types import SimpleNamespace

    from app import chat as chat_module
    from app.main import app

    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    fake = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps(turn)))])
    monkeypatch.setattr(chat_module, "completion", lambda **kwargs: fake)
    with TestClient(app) as client:
        return client.post("/api/chat", json=body).json()


def test_chat_nda_updates_are_merged(tmp_path, monkeypatch):
    turn = {
        "reply": "Which state?", "document": "mutual-nda", "termUpdates": [],
        "ndaUpdates": {**NO_NDA_UPDATES, "purpose": "Vendor evaluation"},
    }
    body = {"messages": [{"role": "user", "content": "hi"}]}
    result = post_chat(tmp_path, monkeypatch, turn, body)
    assert result["reply"] == "Which state?"
    assert result["document"] == "mutual-nda"
    assert result["ndaValues"]["purpose"] == "Vendor evaluation"


def test_chat_choosing_a_document_resets_previous_values(tmp_path, monkeypatch):
    turn = {
        "reply": "Great.", "document": "pilot-agreement", "ndaUpdates": NO_NDA_UPDATES,
        "termUpdates": [
            {"term": "Pilot Period", "value": "60 days"},
            {"term": "Not A Term", "value": "ignored"},
        ],
    }
    body = {
        "messages": [{"role": "user", "content": "pilot"}],
        "document": "mutual-nda", "ndaValues": {"governingLaw": "Delaware"}, "terms": {"Old": "x"},
    }
    result = post_chat(tmp_path, monkeypatch, turn, body)
    assert result["document"] == "pilot-agreement"
    assert result["terms"] == {"Pilot Period": "60 days"}
    assert result["ndaValues"]["governingLaw"] == ""


def test_chat_unknown_document_is_ignored(tmp_path, monkeypatch):
    turn = {"reply": "No leases.", "document": "lease", "ndaUpdates": NO_NDA_UPDATES, "termUpdates": []}
    result = post_chat(tmp_path, monkeypatch, turn, {"messages": [{"role": "user", "content": "lease"}]})
    assert result["document"] is None


def test_template_endpoints(tmp_path, monkeypatch):
    from app.main import app

    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    with TestClient(app) as client:
        assert len(client.get("/api/templates").json()) == 11
        pilot = client.get("/api/templates/pilot-agreement").json()
        assert "Pilot Period" in pilot["terms"]
        assert client.get("/api/templates/lease").status_code == 404
