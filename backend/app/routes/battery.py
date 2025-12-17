from fastapi import APIRouter, Depends, HTTPException
from app.utils.csv_loader import load_csv
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/{brand}/battery",
    tags=["battery"]
)


def _ensure_same_brand(url_brand: str, user_brand: str):
    """
    Security check: URL brand must match logged-in user's brand
    """
    if url_brand != user_brand:
        raise HTTPException(
            status_code=403,
            detail="Brand mismatch – access denied"
        )


@router.get("/temp-performance")
def battery_temp_performance(
    brand: str,
    user = Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])
    return load_csv(brand, "battery_temp_perf.csv")


@router.get("/distribution")
def battery_distribution(
    brand: str,
    user = Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])
    return load_csv(brand, "battery_health_distribution.csv")


@router.get("/risk")
def battery_risk(
    brand: str,
    user = Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])
    return load_csv(brand, "battery_risk_summary.csv")
