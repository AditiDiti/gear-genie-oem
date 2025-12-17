from app.utils.csv_loader import load_csv

def get_engine_insights(brand: str):
    return {
        "temp_performance": load_csv(brand, "engine_temp_perf.csv"),
        "risk": load_csv(brand, "engine_risk_summary.csv"),
        "distribution": load_csv(brand, "engine_perf_distribution.csv"),
    }

def get_brake_insights(brand: str):
    return {
        "temp_performance": load_csv(brand, "brake_temp_perf.csv"),
        "risk": load_csv(brand, "brake_risk_summary.csv"),
        "distribution": load_csv(brand, "brake_wear_distribution.csv"),
    }

def get_battery_insights(brand: str):
    return {
        "temp_performance": load_csv(brand, "battery_temp_perf.csv"),
        "risk": load_csv(brand, "battery_risk_summary.csv"),
        "distribution": load_csv(brand, "battery_health_distribution.csv"),
    }

def get_summary(brand: str):
    return load_csv(brand, "summary.csv")

def get_global_ranking():
    return load_csv("global", "ranking.csv")
