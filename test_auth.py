import requests
import json

# ✅ Railway backend base URL
API_BASE = "https://gear-genie-oem-production.up.railway.app"

# ===============================
# Test login
# ===============================
print("=== Testing Login ===")

login_payload = {
    "email": "user1@example.com",
    "password": "password123",
    "brand": "audi"
}

login_response = requests.post(
    f"{API_BASE}/auth/login",
    json=login_payload
)

print(f"Status: {login_response.status_code}")
print(f"Response: {login_response.text}")

if login_response.status_code == 200:
    data = login_response.json()
    token = data.get("access_token")

    if not token:
        print("\n❌ Token not found in response")
        exit(1)

    print(f"\n✅ Got token: {token[:40]}...")

    # ===============================
    # Test Brakes Endpoint with Token
    # ===============================
    print("\n=== Testing Brakes Endpoint with Token ===")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    brakes_response = requests.get(
        f"{API_BASE}/audi/brakes/temp-performance",
        headers=headers
    )

    print(f"Status: {brakes_response.status_code}")
    print(f"Response: {brakes_response.text[:300]}")

else:
    print("\n❌ Login failed")
