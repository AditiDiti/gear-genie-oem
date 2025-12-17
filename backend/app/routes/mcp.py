from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.utils.auth import get_current_user

router = APIRouter(prefix="/mcp", tags=["MCP"])

class MCPQuery(BaseModel):
    question: str
    brand: str

@router.post("/query")
def mcp_query(payload: MCPQuery, user=Depends(get_current_user)):
    if payload.brand != user["brand"]:
        return {"answer": "You can only query your own brand data."}

    q = payload.question.lower()
    brand = payload.brand.upper()

    if "engine" in q:
        return {
            "answer": (
                f"🔧 Engine Health Summary for {brand}:\n"
                "• Engine performance is stable across all temperature bands.\n"
                "• No imminent engine failure detected.\n"
                "• Fleet shows high reliability under normal operating conditions."
            )
        }

    if "battery" in q:
        return {
            "answer": (
                f"🔋 Battery Health Summary for {brand}:\n"
                "• Battery health remains in the 80–100% range for most vehicles.\n"
                "• Performance is consistent across temperature variations.\n"
                "• Low probability of battery failure in the near term."
            )
        }

    if "brake" in q:
        return {
            "answer": (
                f"🛑 Brake System Summary for {brand}:\n"
                "• Brake wear is within acceptable thresholds.\n"
                "• No critical brake failure risks identified.\n"
                "• Preventive maintenance is recommended as per schedule."
            )
        }

    if "ranking" in q or "rank" in q:
        return {
            "answer": (
                f"🏆 Global Ranking Insight for {brand}:\n"
                "• Brand ranks competitively based on fleet health score.\n"
                "• Strong performance compared to industry peers."
            )
        }

    if "fleet" in q or "summary" in q or "overall" in q:
        return {
            "answer": (
                f"📊 Overall Fleet Summary for {brand}:\n"
                "• Fleet health is rated GOOD.\n"
                "• No critical risks detected across engine, battery or brakes.\n"
                "• Operational stability is high."
            )
        }

    return {
        "answer": (
            "I can provide insights on:\n"
            "• Engine health\n"
            "• Battery performance\n"
            "• Brake wear\n"
            "• Fleet summary\n"
            "• Global ranking"
        )
    }
