from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.utils.security import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # ✅ FIX
        email = payload.get("email")
        brand = payload.get("brand")

        if not email or not brand:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return {
            "email": email,
            "brand": brand
        }

    except JWTError as e:
        print(f"JWT Error: {e}")
        print(f"Token: {token[:50]}...")
        print(f"SECRET_KEY: {SECRET_KEY[:20]}...")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
