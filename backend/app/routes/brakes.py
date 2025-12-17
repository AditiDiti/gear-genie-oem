from fastapi import APIRouter, Depends, HTTPException
from app.utils.csv_loader import load_csv
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/{brand}/brakes",
    tags=["brakes"]
)

def _ensure_same_brand(url_brand: str, user_brand: str):
    if url_brand != user_brand:
        raise HTTPException(
            status_code=403,
            detail="Brand mismatch – access denied"
        )

# ✅ BRAKE TEMP vs PERFORMANCE
@router.get("/temp-performance")
def brake_temp_performance(
    brand: str,
    user=Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])

    rows = load_csv(brand, "brake_temp_perf.csv")

    return [
        {
            "temperature": row["temp_band"],
            # ✅ using YOUR actual column
            "wear": round(float(row["avg_brake_temp_c"]), 2)
        }
        for row in rows
    ]


# ✅ BRAKE WEAR DISTRIBUTION
@router.get("/wear-distribution")
def brake_wear_distribution(
    brand: str,
    user=Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])

    rows = load_csv(brand, "brake_wear_distribution.csv")

    result = []
    for row in rows:
        # CSV has duplicate headers, CSV loader keeps only last one
        # So we must read raw values safely
        keys = list(row.keys())
        if len(keys) < 2:
            continue

        label = list(row.values())[0]
        value = list(row.values())[1]

        result.append({
            "label": label,
            "value": int(value)
        })

    return result


# ✅ BRAKE RISK SUMMARY
@router.get("/risk")
def brake_risk(
    brand: str,
    user=Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])

    rows = load_csv(brand, "brake_risk_summary.csv")
    row = rows[0]

    risk_flag = int(row["brake_issue_imminent"])
    confidence = round(float(row["fraction"]) * 100, 0)

    return {
        "risk": "High Risk" if risk_flag == 1 else "Low Risk",
        "confidence": confidence
    }
