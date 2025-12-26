from pathlib import Path
import pandas as pd
from fastapi import HTTPException

# Find the project root by looking for the 'data' folder
def find_data_dir():
    # Try multiple possible paths
    possible_paths = [
        Path(__file__).resolve().parents[2] / "data" / "processed",  # For local dev
        Path(__file__).resolve().parents[3] / "data" / "processed",  # For Railway (if structure is different)
        Path("/app/data/processed"),  # Direct Railway path
        Path("/data/processed"),  # Alternative Railway path
    ]
    
    for path in possible_paths:
        if path.exists():
            print(f"✅ Found data directory at: {path}")
            return path
    
    print(f"⚠️  No data directory found. Checked paths: {[str(p) for p in possible_paths]}")
    return possible_paths[0]  # Return the preferred path even if it doesn't exist

BASE_DIR = find_data_dir()
BASE_DATA_DIR = BASE_DIR


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
