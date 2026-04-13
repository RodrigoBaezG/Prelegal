import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..database import get_db
from ..auth import get_current_user_id
from .chat import SUPPORTED_DOCS

router = APIRouter()


class SaveDocumentRequest(BaseModel):
    document_type: str
    title: str
    fields: dict[str, Any]


class DocumentSummary(BaseModel):
    id: int
    document_type: str
    title: str
    created_at: str


class DocumentDetail(DocumentSummary):
    fields: dict[str, Any]


def _row_to_detail(row) -> dict:
    return {
        "id": row["id"],
        "document_type": row["document_type"],
        "title": row["title"],
        "created_at": row["created_at"],
        "fields": json.loads(row["fields_json"]),
    }


@router.get("", response_model=list[DocumentSummary])
def list_documents(
    user_id: int = Depends(get_current_user_id),
    db=Depends(get_db),
):
    rows = db.execute(
        "SELECT id, document_type, title, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    return [dict(row) for row in rows]


@router.post("", response_model=DocumentDetail, status_code=201)
def save_document(
    body: SaveDocumentRequest,
    user_id: int = Depends(get_current_user_id),
    db=Depends(get_db),
):
    if body.document_type not in SUPPORTED_DOCS:
        raise HTTPException(status_code=422, detail=f"Unsupported document_type '{body.document_type}'")

    cursor = db.execute(
        "INSERT INTO documents (user_id, document_type, title, fields_json) VALUES (?, ?, ?, ?)",
        (user_id, body.document_type, body.title, json.dumps(body.fields)),
    )
    db.commit()
    row = db.execute(
        "SELECT id, document_type, title, fields_json, created_at FROM documents WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()
    return _row_to_detail(row)


@router.get("/{doc_id}", response_model=DocumentDetail)
def get_document(
    doc_id: int,
    user_id: int = Depends(get_current_user_id),
    db=Depends(get_db),
):
    row = db.execute(
        "SELECT id, document_type, title, fields_json, created_at FROM documents WHERE id = ? AND user_id = ?",
        (doc_id, user_id),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return _row_to_detail(row)


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    user_id: int = Depends(get_current_user_id),
    db=Depends(get_db),
):
    result = db.execute(
        "DELETE FROM documents WHERE id = ? AND user_id = ?", (doc_id, user_id)
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Document not found")
