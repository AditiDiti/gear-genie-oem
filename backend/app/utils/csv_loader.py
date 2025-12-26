from pathlib import Path
import pandas as pd
from fastapi import HTTPException
import os

# Use os.getcwd() to get the actual working directory
# When Procfile does "cd backend && uvicorn", cwd is the backend folder
# So we need to go up one level to reach data/processed
cwd = Path(os.getcwd())
if cwd.name == "backend":
    # We're running from backend directory (Railway)
    BASE_DATA_DIR = cwd.parent / "data" / "processed"
else:
    # We're running from project root (local development)
    BASE_DATA_DIR = cwd / "data" / "processed"

print(f"📊 Current working directory: {cwd}")
print(f"📊 Data directory path: {BASE_DATA_DIR}")
print(f"📊 Data directory exists: {BASE_DATA_DIR.exists()}")


def load_csv(brand: str, filename: str):
    file_path = BASE_DATA_DIR / brand.lower() / filename

    if not file_path.exists():
        # Check if parent data directory exists
        if not BASE_DATA_DIR.exists():
            raise HTTPException(
                status_code=503,
                detail=f"Data directory not configured. Please ensure CSV files are deployed."
            )
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
