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


def test_chat_endpoint_returns_reply_and_merged_values(tmp_path, monkeypatch):
    import json
    from types import SimpleNamespace

    from app import chat as chat_module
    from app.main import app

    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    turn = {
        "reply": "Which state?",
        "updates": {
            "purpose": "Vendor evaluation", "effectiveDate": None, "mndaTermYears": None,
            "mndaUntilTerminated": None, "confidentialityYears": None, "confidentialityPerpetual": None,
            "governingLaw": None, "jurisdiction": None, "modifications": None,
        },
    }
    fake = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps(turn)))])
    monkeypatch.setattr(chat_module, "completion", lambda **kwargs: fake)

    with TestClient(app) as client:
        body = {"messages": [{"role": "user", "content": "hi"}], "values": {}}
        result = client.post("/api/chat", json=body).json()

    assert result["reply"] == "Which state?"
    assert result["values"]["purpose"] == "Vendor evaluation"
