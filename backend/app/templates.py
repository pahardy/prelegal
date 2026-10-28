"""Catalog and template loading, including extraction of each template's key terms."""

import json
import re
from functools import cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NDA_ID = "mutual-nda"
TERM_SPAN = re.compile(r'<span class="(?:coverpage|orderform|keyterms|sow)_link">([^<]+)</span>')


def doc_id(filename: str) -> str:
    """Catalog filename to id, e.g. Pilot-Agreement.md -> pilot-agreement."""
    return filename.removesuffix(".md").lower()


@cache
def catalog() -> dict[str, dict]:
    """Supported documents keyed by id. The NDA cover page is part of the NDA, not a document."""
    entries = json.loads((ROOT / "catalog.json").read_text())
    return {
        doc_id(e["filename"]): e
        for e in entries
        if not e["filename"].endswith("-coverpage.md")
    }


def key_terms(markdown: str) -> list[str]:
    """Unique defined terms in order of appearance, with possessives folded in (Customer's -> Customer)."""
    terms = (re.sub(r"[’']s$", "", t) for t in TERM_SPAN.findall(markdown))
    return list(dict.fromkeys(terms))


@cache
def load(document_id: str) -> dict:
    """Template markdown files and key terms. The NDA has its own fields, so it lists no terms."""
    entry = catalog()[document_id]
    if document_id == NDA_ID:
        names = ["Mutual-NDA-coverpage.md", entry["filename"]]
        return {"name": entry["name"], "files": [_read(n) for n in names], "terms": []}
    text = _read(entry["filename"])
    return {"name": entry["name"], "files": [text], "terms": key_terms(text)}


def _read(filename: str) -> str:
    return (ROOT / "templates" / filename).read_text()
