"""SQLite access. The database is recreated from scratch on every start."""

import os
import sqlite3
from pathlib import Path

DB_PATH = Path(os.environ.get("DB_PATH", "prelegal.db"))

SCHEMA = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def init_db() -> None:
    """Delete any existing database file and create a fresh schema."""
    DB_PATH.unlink(missing_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(SCHEMA)


def connect() -> sqlite3.Connection:
    """Open a connection to the database."""
    return sqlite3.connect(DB_PATH)
