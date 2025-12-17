from fastapi import APIRouter, Depends, HTTPException
from app.utils.csv_loader import load_csv
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/{brand}/engine",
    tags=["engine"]
)


def _ensure_same_brand(url_brand: str, user_brand: str):
    """
    Ensure user can only access their own brand data
    """
    if url_brand != user_brand:
        raise HTTPException(
            status_code=403,
            detail="Brand mismatch – access denied"
        )


@router.get("/temp-performance")
def engine_temp_performance(
    brand: str,
    user = Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])
    return load_csv(brand, "engine_temp_perf.csv")


@router.get("/distribution")
def engine_distribution(
    brand: str,
    user = Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])
    return load_csv(brand, "engine_perf_distribution.csv")


@router.get("/risk")
def engine_risk(
    brand: str,
    user = Depends(get_current_user)
):
    _ensure_same_brand(brand, user["brand"])
    return load_csv(brand, "engine_risk_summary.csv")
