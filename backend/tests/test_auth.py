from tests.conftest import sign_up


def test_signup_signs_in_and_me_returns_user(client):
    res = sign_up(client)
    assert res.status_code == 201
    assert client.get("/api/auth/me").json()["email"] == "a@example.com"


def test_signup_duplicate_email_is_rejected_case_insensitively(client):
    sign_up(client, "a@example.com")
    assert sign_up(client, "A@Example.com").status_code == 409


def test_signup_rejects_short_password_and_bad_email(client):
    assert sign_up(client, password="short").status_code == 422
    assert sign_up(client, email="nope").status_code == 422


def test_signin_wrong_password_is_rejected(client):
    sign_up(client)
    client.post("/api/auth/signout")
    res = client.post("/api/auth/signin", json={"email": "a@example.com", "password": "wrongpass1"})
    assert res.status_code == 401


def test_signin_after_signout_restores_access(client):
    sign_up(client)
    client.post("/api/auth/signout")
    assert client.get("/api/auth/me").status_code == 401
    client.post("/api/auth/signin", json={"email": "a@example.com", "password": "password123"})
    assert client.get("/api/auth/me").status_code == 200


def test_me_requires_a_session(client):
    assert client.get("/api/auth/me").status_code == 401


def test_session_cookie_is_httponly(client):
    res = sign_up(client)
    assert "httponly" in res.headers["set-cookie"].lower()


def test_password_longer_than_72_bytes_is_a_validation_error_not_a_crash(client):
    assert sign_up(client, password="a" * 72).status_code == 201
    assert sign_up(client, "b@example.com", "a" * 73).status_code == 422
    assert sign_up(client, "c@example.com", "é" * 37).status_code == 422


def test_signin_unknown_email_is_rejected_like_a_wrong_password(client):
    res = client.post("/api/auth/signin", json={"email": "nobody@example.com", "password": "password123"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email or password"
