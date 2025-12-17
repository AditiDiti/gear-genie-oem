from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os

# Routers
from app.routes.auth import router as auth_router
from app.routes.ranking import router as ranking_router
from app.routes.summary import router as summary_router
from app.routes.engine import router as engine_router
from app.routes.battery import router as battery_router
from app.routes.brakes import router as brakes_router
from app.routes.mcp import router as mcp_router

# Database and initialization
from app.db import SessionLocal, User, Base, engine
from app.utils.security import hash_password

app = FastAPI(title="OEM Analytics API")

# ✅ INITIALIZE DATABASE AND USERS ON STARTUP
def init_db():
    """Create tables and default users if they don't exist"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️  Error creating tables: {e}")
        return
    
    db = SessionLocal()
    
    try:
        # Check if users already exist
        user_count = db.query(User).count()
        
        if user_count == 0:
            print("🔄 Initializing database with default users...")
            
            # Get all brand directories from data folder
            data_dir = Path(__file__).resolve().parent.parent.parent / "data" / "processed"
            
            if not data_dir.exists():
                print(f"⚠️  Data directory not found at {data_dir}")
                print("Creating fallback users for common brands...")
                brands = ["ford", "honda", "toyota", "bmw", "audi", "chevrolet", "nissan", "hyundai", "kia", "mercedes-benz"]
                
                for brand in brands:
                    email = f"{brand}_admin@oem.com"
                    existing_user = db.query(User).filter(User.email == email).first()
                    if not existing_user:
                        user = User(
                            email=email,
                            password_hash=hash_password("admin123"),
                            brand=brand
                        )
                        db.add(user)
                        print(f"✅ Created user: {email}")
            else:
                # Create users based on data directories
                for brand_dir in data_dir.iterdir():
                    if not brand_dir.is_dir():
                        continue
                    
                    brand = brand_dir.name.lower()
                    email = f"{brand}_admin@oem.com"
                    
                    # Check if user already exists
                    existing_user = db.query(User).filter(User.email == email).first()
                    if not existing_user:
                        user = User(
                            email=email,
                            password_hash=hash_password("admin123"),
                            brand=brand
                        )
                        db.add(user)
                        print(f"✅ Created user: {email}")
            
            db.commit()
            print("✅ Database initialized successfully!")
        else:
            print(f"✅ Database already initialized with {user_count} users")
    
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()

# Run initialization on startup
init_db()

# =========================
# CORS CONFIG
# =========================
# Get allowed origins from environment or use defaults
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://gear-genie-oem.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def health():
    return {"status": "API running"}

# =========================
# ROUTERS
# =========================
app.include_router(auth_router)
app.include_router(ranking_router)
app.include_router(summary_router)
app.include_router(engine_router)
app.include_router(battery_router)
app.include_router(brakes_router)
app.include_router(mcp_router)
