"""Saved documents. Each belongs to one user; the state holds everything needed to resume the chat."""

import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import User, current_user
from app.db import connect

router = APIRouter(prefix="/api/documents")


class DocumentSummary(BaseModel):
    id: int
    title: str
    updated_at: str


class SavedDocument(BaseModel):
    id: int
    title: str
    state: dict


def save(user_id: int, document_id: int | None, title: str, state: dict) -> int:
    """Update the user's document, or create one when the id is missing or not theirs. Returns the id."""
    payload = json.dumps(state)
    with connect() as conn:
        if document_id is not None:
            cursor = conn.execute(
                "UPDATE documents SET title = ?, state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
                (title, payload, document_id, user_id),
            )
            if cursor.rowcount:
                return document_id
        cursor = conn.execute(
            "INSERT INTO documents (user_id, title, state) VALUES (?, ?, ?)", (user_id, title, payload)
        )
        return cursor.lastrowid


@router.get("")
def list_documents(user: User = Depends(current_user)) -> list[DocumentSummary]:
    """The user's documents, most recently updated first."""
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, title, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC, id DESC",
            (user.id,),
        ).fetchall()
    return [DocumentSummary(**dict(r)) for r in rows]


@router.get("/{document_id}")
def get_document(document_id: int, user: User = Depends(current_user)) -> SavedDocument:
    """One of the user's documents with its saved chat state."""
    with connect() as conn:
        row = conn.execute(
            "SELECT id, title, state FROM documents WHERE id = ? AND user_id = ?", (document_id, user.id)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return SavedDocument(id=row["id"], title=row["title"], state=json.loads(row["state"]))


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, user: User = Depends(current_user)) -> None:
    """Delete one of the user's documents."""
    with connect() as conn:
        cursor = conn.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", (document_id, user.id))
    if not cursor.rowcount:
        raise HTTPException(status_code=404, detail="Document not found")
