import os
from sqlalchemy import create_engine, Column, String
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path

# ✅ Database URL (env-based, fallback to sqlite)
DATABASE_URL = os.getenv("DATABASE_URL", None)

if not DATABASE_URL:
    # For local development, use SQLite in the backend directory
    db_path = Path(__file__).resolve().parent.parent / "users.db"
    DATABASE_URL = f"sqlite:///{db_path}"

print(f"📊 Database URL: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ✅ User model
class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    password_hash = Column(String, nullable=False)
    brand = Column(String, index=True, nullable=False)


# ✅ Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Create tables
Base.metadata.create_all(bind=engine)
