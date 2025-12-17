from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.routes.auth import router as auth_router
from app.routes.ranking import router as ranking_router
from app.routes.summary import router as summary_router
from app.routes.engine import router as engine_router
from app.routes.battery import router as battery_router
from app.routes.brakes import router as brakes_router
from app.routes.mcp import router as mcp_router

# DB + Models
from app.database import SessionLocal
from app.models import User
from app.utils.security import hash_password  # adjust if path differs


app = FastAPI(title="OEM Analytics API")

# =========================
# CORS CONFIG
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://gear-genie-oem.vercel.app",
        "https://gear-genie-oem-*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SEED DEFAULT DEMO USER
# =========================
def seed_default_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "user1@example.com").first()
        if not user:
            demo_user = User(
                email="user1@example.com",
                brand="audi",
                hashed_password=hash_password("password123"),
            )
            db.add(demo_user)
            db.commit()
            print("✅ Demo user created")
        else:
            print("ℹ️ Demo user already exists")
    except Exception as e:
        print("❌ Error seeding demo user:", e)
    finally:
        db.close()


# Call seeding ON STARTUP
seed_default_user()

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def health_check():
    return {"status": "OEM Analytics API is running"}

# =========================
# ROUTERS (AUTH FIRST)
# =========================
app.include_router(auth_router)
app.include_router(ranking_router)
app.include_router(summary_router)
app.include_router(engine_router)
app.include_router(battery_router)
app.include_router(brakes_router)
app.include_router(mcp_router)
