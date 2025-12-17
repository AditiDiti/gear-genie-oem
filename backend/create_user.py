from pathlib import Path
from app.db import SessionLocal, User
from app.utils.security import hash_password

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data" / "processed"

def main():
    db = SessionLocal()

    for brand_dir in DATA_DIR.iterdir():
        if not brand_dir.is_dir():
            continue

        brand = brand_dir.name.lower()
        user = User(
            email=f"{brand}_admin@oem.com",
            password_hash=hash_password("admin123"),  # RAW ONLY
            brand=brand,
        )
        db.add(user)

    db.commit()
    db.close()
    print("✅ USERS CREATED")

if __name__ == "__main__":
    main()
