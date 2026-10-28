from tests.conftest import sign_up
from tests.test_app import NO_NDA_UPDATES, mock_model, post_chat

PILOT_TURN = {
    "reply": "Got it.", "document": "pilot-agreement", "ndaUpdates": NO_NDA_UPDATES,
    "termUpdates": [{"term": "Pilot Period", "value": "60 days"}],
}


def chat_pilot(client, **extra):
    body = {"messages": [{"role": "user", "content": "pilot"}], **extra}
    return post_chat(client, body)


def test_chat_requires_sign_in(client):
    assert client.post("/api/chat", json={"messages": []}).status_code == 401
    assert client.get("/api/documents").status_code == 401


def test_chat_autosaves_a_draft_and_updates_it_on_the_next_turn(client, monkeypatch):
    sign_up(client)
    mock_model(monkeypatch, PILOT_TURN)
    first = chat_pilot(client)
    assert first["documentId"]
    listed = client.get("/api/documents").json()
    assert [d["title"] for d in listed] == ["Pilot Agreement"]

    second = chat_pilot(client, documentId=first["documentId"], document="pilot-agreement")
    assert second["documentId"] == first["documentId"]
    assert len(client.get("/api/documents").json()) == 1


def test_saved_document_restores_chat_state(client, monkeypatch):
    sign_up(client)
    mock_model(monkeypatch, PILOT_TURN)
    saved_id = chat_pilot(client)["documentId"]
    state = client.get(f"/api/documents/{saved_id}").json()["state"]
    assert state["document"] == "pilot-agreement"
    assert state["terms"] == {"Pilot Period": "60 days"}
    assert [m["role"] for m in state["messages"]] == ["user", "assistant"]


def test_switching_document_type_creates_a_new_draft(client, monkeypatch):
    sign_up(client)
    mock_model(monkeypatch, PILOT_TURN)
    first = chat_pilot(client)
    mock_model(monkeypatch, {**PILOT_TURN, "document": "sla"})
    second = chat_pilot(client, documentId=first["documentId"], document="pilot-agreement")
    assert second["documentId"] != first["documentId"]
    assert len(client.get("/api/documents").json()) == 2


def test_users_cannot_see_modify_or_delete_each_others_documents(client, monkeypatch):
    sign_up(client, "a@example.com")
    mock_model(monkeypatch, PILOT_TURN)
    a_id = chat_pilot(client)["documentId"]
    client.post("/api/auth/signout")

    sign_up(client, "b@example.com")
    assert client.get("/api/documents").json() == []
    assert client.get(f"/api/documents/{a_id}").status_code == 404
    assert client.delete(f"/api/documents/{a_id}").status_code == 404
    b_id = chat_pilot(client, documentId=a_id, document="pilot-agreement")["documentId"]
    assert b_id != a_id

    client.post("/api/auth/signout")
    client.post("/api/auth/signin", json={"email": "a@example.com", "password": "password123"})
    assert client.get(f"/api/documents/{a_id}").status_code == 200


def test_delete_removes_the_document(client, monkeypatch):
    sign_up(client)
    mock_model(monkeypatch, PILOT_TURN)
    saved_id = chat_pilot(client)["documentId"]
    assert client.delete(f"/api/documents/{saved_id}").status_code == 204
    assert client.get("/api/documents").json() == []
