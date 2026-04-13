from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlite3 import IntegrityError

from ..database import get_db
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter()


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    email: str


@router.post("/register", response_model=AuthResponse)
def register(body: AuthRequest, db=Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    hashed = hash_password(body.password)
    try:
        cursor = db.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (body.email.lower(), hashed),
        )
        db.commit()
        user_id = cursor.lastrowid
    except IntegrityError:
        raise HTTPException(status_code=409, detail="An account with that email already exists")
    token = create_access_token(user_id)
    return AuthResponse(token=token, email=body.email.lower())


@router.post("/login", response_model=AuthResponse)
def login(body: AuthRequest, db=Depends(get_db)):
    row = db.execute(
        "SELECT id, password_hash FROM users WHERE email = ?", (body.email.lower(),)
    ).fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(row["id"])
    return AuthResponse(token=token, email=body.email.lower())
