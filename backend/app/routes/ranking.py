from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user
import pandas as pd
from app.utils.csv_loader import BASE_DATA_DIR

router = APIRouter(prefix="/ranking", tags=["ranking"])

@router.get("")
def brand_ranking(user = Depends(get_current_user)):
    """
    Global brand ranking.
    Accessible to any authenticated user.
    """
    results = []

    for brand_dir in BASE_DATA_DIR.iterdir():
        if not brand_dir.is_dir():
            continue

        brand = brand_dir.name.lower()
        master_file = brand_dir / "master_vehicle_data.csv"

        if not master_file.exists():
            continue

        df = pd.read_csv(master_file)

        engine_risk = df["engine_failure_imminent"].mean()
        battery_risk = df["battery_issue_imminent"].mean()
        brake_risk = df["brake_issue_imminent"].mean()

        fleet_health = 100 * (1 - (engine_risk + battery_risk + brake_risk) / 3)

        results.append({
            "brand": brand,
            "fleet_health_score": round(fleet_health, 2),
            "engine_health": round(100 * (1 - engine_risk), 2),
            "battery_health": round(100 * (1 - battery_risk), 2),
            "brake_health": round(100 * (1 - brake_risk), 2),
            "total_vehicles": int(len(df)),
        })

    results.sort(key=lambda x: x["fleet_health_score"], reverse=True)

    for idx, row in enumerate(results, start=1):
        row["rank"] = idx

    return {
        "total_brands": len(results),
        "ranking": results
    }
