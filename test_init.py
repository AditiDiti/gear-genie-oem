import sys
sys.path.insert(0, '/c/oem-analytics-backend/backend')

from app.db import SessionLocal, User, Base, engine
from app.utils.security import hash_password
from app.main import init_db

print("Testing database initialization...")
init_db()

print("\nChecking created users:")
db = SessionLocal()
users = db.query(User).all()
for user in users:
    print(f"  - {user.email} (brand: {user.brand})")
db.close()

print(f"\n✅ Total users created: {len(users)}")
