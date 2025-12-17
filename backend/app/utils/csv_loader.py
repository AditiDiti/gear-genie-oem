from pathlib import Path
import pandas as pd
from fastapi import HTTPException

BASE_DIR = Path(__file__).resolve().parents[3]
BASE_DATA_DIR = BASE_DIR / "data" / "processed"


def load_csv(brand: str, filename: str):
    file_path = BASE_DATA_DIR / brand.lower() / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Data file not found for brand '{brand}': {filename}"
        )

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading CSV file '{filename}': {str(e)}"
        )

    return df.to_dict(orient="records")
