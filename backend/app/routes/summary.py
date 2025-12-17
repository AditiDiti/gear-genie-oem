from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from app.utils.csv_loader import BASE_DATA_DIR
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/{brand}/summary",
    tags=["summary"]
)


def _ensure_same_brand(url_brand: str, user_brand: str):
    if url_brand != user_brand:
        raise HTTPException(
            status_code=403,
            detail="Brand mismatch – access denied"
        )


@router.get("")
def brand_summary(
    brand: str,
    user = Depends(get_current_user)
):
    # security check
    _ensure_same_brand(brand, user["brand"])

    path = BASE_DATA_DIR / brand
    df = pd.read_csv(path / "master_vehicle_data.csv")

    engine_risk = df["engine_failure_imminent"].mean()
    battery_risk = df["battery_issue_imminent"].mean()
    brake_risk = df["brake_issue_imminent"].mean()

    return {
        "fleet_health_score": round(
            100 * (1 - (engine_risk + battery_risk + brake_risk) / 3), 1
        ),
        "engine_health": round(100 * (1 - engine_risk), 1),
        "battery_health": round(100 * (1 - battery_risk), 1),
        "brake_health": round(100 * (1 - brake_risk), 1),
        "total_vehicles": int(len(df))
    }
