from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
import bcrypt

# 🔐 JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)


# ✅ Password hashing
def hash_password(password: str) -> str:
    try:
        # Use bcrypt directly to avoid passlib's version checking issues
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Error hashing password: {e}")
        # Fallback to passlib
        return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8') if isinstance(hashed, str) else hashed
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Error verifying password: {e}")
        # Fallback to passlib
        return pwd_context.verify(password, hashed)


# ✅ JWT creation
def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt
