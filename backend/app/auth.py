"""Sign up, sign in and the current-user dependency. Sessions are JWTs in an HttpOnly cookie."""

import secrets
import sqlite3
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel, Field, field_validator

from app.db import connect

# Random per process: the database is recreated on every start, so old sessions must not survive it.
SECRET = secrets.token_hex(32)
# Checked when the email is unknown so that sign-in takes the same time either way.
DUMMY_HASH = bcrypt.hashpw(b"unused", bcrypt.gensalt())
COOKIE = "session"
SESSION_DAYS = 7

router = APIRouter(prefix="/api/auth")


class Credentials(BaseModel):
    email: str = Field(min_length=3, pattern=r"^[^@\s]+@[^@\s]+$")
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def fits_bcrypt(cls, value: str) -> str:
        """bcrypt only accepts up to 72 bytes."""
        if len(value.encode()) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return value


class User(BaseModel):
    id: int
    email: str


def start_session(response: Response, user: User) -> User:
    """Set the session cookie for the user."""
    expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    token = jwt.encode({"sub": str(user.id), "exp": expires}, SECRET, algorithm="HS256")
    response.set_cookie(COOKIE, token, httponly=True, samesite="lax", max_age=SESSION_DAYS * 86400)
    return user


def current_user(session: str | None = Cookie(default=None)) -> User:
    """Dependency: the signed-in user, or 401."""
    try:
        user_id = int(jwt.decode(session or "", SECRET, algorithms=["HS256"])["sub"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Not signed in")
    with connect() as conn:
        row = conn.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Not signed in")
    return User(id=row["id"], email=row["email"])


@router.post("/signup", status_code=201)
def signup(creds: Credentials, response: Response) -> User:
    """Create an account and sign in."""
    email = creds.email.lower()
    hashed = bcrypt.hashpw(creds.password.encode(), bcrypt.gensalt()).decode()
    try:
        with connect() as conn:
            cursor = conn.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, hashed))
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    return start_session(response, User(id=cursor.lastrowid, email=email))


@router.post("/signin")
def signin(creds: Credentials, response: Response) -> User:
    """Sign in with email and password."""
    with connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (creds.email.lower(),)).fetchone()
    stored = row["password_hash"].encode() if row else DUMMY_HASH
    if not bcrypt.checkpw(creds.password.encode(), stored) or row is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return start_session(response, User(id=row["id"], email=row["email"]))


@router.post("/signout", status_code=204)
def signout(response: Response) -> None:
    """Clear the session cookie."""
    response.delete_cookie(COOKIE)


@router.get("/me")
def me(user: User = Depends(current_user)) -> User:
    """Return the signed-in user."""
    return user
