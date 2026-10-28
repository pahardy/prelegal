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
