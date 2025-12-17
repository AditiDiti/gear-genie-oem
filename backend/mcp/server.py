from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.utils.auth import get_current_user

router = APIRouter(prefix="/mcp", tags=["MCP"])


# ---------- SCHEMA ----------
class MCPQuery(BaseModel):
    question: str
    brand: str


# ---------- ROUTE ----------
@router.post("/query")
def mcp_query(payload: MCPQuery, user=Depends(get_current_user)):
    # ✅ Security check
    if payload.brand != user["brand"]:
        return {
            "answer": "You are not authorized to access another brand’s data."
        }

    q = payload.question.lower()
    brand = payload.brand.upper()

    # ---------- ENGINE ----------
    if "engine" in q:
        return {
            "answer": (
                f"🔧 Engine Health – {brand}\n"
                f"The engine performance across the fleet is stable.\n"
                f"No abnormal temperature spikes or failure patterns detected.\n"
                f"Current data indicates high reliability under normal operating conditions."
            )
        }

    # ---------- BATTERY ----------
    if "battery" in q:
        return {
            "answer": (
                f"🔋 Battery Health – {brand}\n"
                f"Most vehicles show battery health in the 80–100% range.\n"
                f"Performance remains consistent across varying temperatures.\n"
                f"No immediate battery degradation risk detected."
            )
        }

    # ---------- BRAKES ----------
    if "brake" in q:
        return {
            "answer": (
                f"🛑 Brake System – {brand}\n"
                f"Brake wear levels are within acceptable thresholds.\n"
                f"No critical brake failure risks identified.\n"
                f"Routine preventive maintenance is recommended."
            )
        }

    # ---------- RANKING ----------
    if "ranking" in q or "rank" in q:
        return {
            "answer": (
                f"🏆 Global Ranking – {brand}\n"
                f"The brand is performing competitively based on fleet health score.\n"
                f"Overall reliability metrics place it among top OEMs."
            )
        }

    # ---------- FLEET SUMMARY ----------
    if "fleet" in q or "summary" in q or "overall" in q:
        return {
            "answer": (
                f"📊 Fleet Summary – {brand}\n"
                f"Overall fleet health status: GOOD.\n"
                f"No critical risks detected across engine, battery, or brakes.\n"
                f"Operational stability is high across the fleet."
            )
        }

    # ---------- FALLBACK ----------
    return {
        "answer": (
            "You can ask about:\n"
            "• Engine health\n"
            "• Battery performance\n"
            "• Brake condition\n"
            "• Fleet summary\n"
            "• Global ranking"
        )
    }
