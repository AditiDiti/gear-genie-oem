from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import SessionLocal, User
from app.utils.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ✅ Request schema
class LoginPayload(BaseModel):
    email: str
    password: str
    brand: str


@router.post("/login")
def login(payload: LoginPayload):
    db = SessionLocal()

    user = db.query(User).filter(User.email == payload.email).first()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.brand != payload.brand:
        raise HTTPException(status_code=401, detail="Invalid brand selection")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "email": user.email,
        "brand": user.brand
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "brand": user.brand
    }
