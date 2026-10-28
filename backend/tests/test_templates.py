from app.templates import NDA_ID, catalog, key_terms, load


def test_catalog_has_eleven_documents_without_coverpage():
    docs = catalog()
    assert len(docs) == 11
    assert NDA_ID in docs
    assert "mutual-nda-coverpage" not in docs


def test_key_terms_folds_possessives_and_dedupes():
    md = '<span class="orderform_link">Customer’s</span> <span class="orderform_link">Customer</span> <span class="keyterms_link">Pilot Period</span>'
    assert key_terms(md) == ["Customer", "Pilot Period"]


def test_every_generic_document_loads_with_terms():
    for document_id in catalog():
        loaded = load(document_id)
        assert loaded["files"]
        if document_id != NDA_ID:
            assert loaded["terms"], document_id


def test_nda_loads_cover_page_and_terms_without_generic_fields():
    loaded = load(NDA_ID)
    assert len(loaded["files"]) == 2
    assert loaded["terms"] == []
