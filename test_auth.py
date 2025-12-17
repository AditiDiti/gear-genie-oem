import requests
import json

# Test login
print("=== Testing Login ===")
login_payload = {
    "email": "user1@example.com",
    "password": "password123",
    "brand": "audi"
}

login_response = requests.post(
    "http://127.0.0.1:8000/auth/login",
    json=login_payload
)

print(f"Status: {login_response.status_code}")
print(f"Response: {login_response.text}")

if login_response.status_code == 200:
    data = login_response.json()
    token = data.get("access_token")
    print(f"\n✅ Got token: {token[:50]}...")
    
    # Test using the token
    print("\n=== Testing Brakes Endpoint with Token ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    brakes_response = requests.get(
        "http://127.0.0.1:8000/audi/brakes/temp-performance",
        headers=headers
    )
    
    print(f"Status: {brakes_response.status_code}")
    print(f"Response: {brakes_response.text[:200]}")
else:
    print(f"\n❌ Login failed")
