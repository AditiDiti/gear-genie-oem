from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.ranking import router as ranking_router
from app.routes.summary import router as summary_router
from app.routes.engine import router as engine_router
from app.routes.battery import router as battery_router
from app.routes.brakes import router as brakes_router
from mcp.server import router as mcp_router
from app.routes import mcp
# from app.routes import assistant


app = FastAPI(title="OEM Analytics API")


# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ✅ Root health check
@app.get("/")
def health_check():
    return {"status": "OEM Analytics API is running"}


# ✅ Routers (auth FIRST)
app.include_router(auth_router)
app.include_router(ranking_router)
app.include_router(summary_router)
app.include_router(engine_router)
app.include_router(battery_router)
app.include_router(brakes_router)
app.include_router(mcp_router)
app.include_router(mcp_router)  # from app.routes.mcp
# app.include_router(assistant.router)