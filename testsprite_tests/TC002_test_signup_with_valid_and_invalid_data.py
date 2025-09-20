import requests
import uuid
import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_signup_with_valid_and_invalid_data():
    signup_url = f"{BASE_URL}/auth/signup"

    # Valid data for successful signup - using environment variables for password
    test_password = os.getenv("TEST_VALID_PASSWORD", "ValidPass123")
    valid_user = {
        "name": "Test User",
        "email": f"testuser_{uuid.uuid4()}@example.com",
        "password": test_password
    }

    # Invalid test cases: missing fields or invalid data
    invalid_users = [
        {},  # completely empty
        {"name": "NoEmailUser", "password": test_password},  # missing email
        {"email": "no_name@example.com", "password": test_password},  # missing name
        {"name": "NoPasswordUser", "email": "nopassword@example.com"},  # missing password
        {"name": "ShortPass", "email": "shortpass@example.com", "password": "short"},  # password too short
        {"name": "InvalidEmail", "email": "invalidemail", "password": test_password},  # invalid email format
    ]

    user_id = None

    try:
        # Test valid signup
        response = requests.post(signup_url, json=valid_user, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 201 or response.status_code == 200, f"Expected 200 or 201, got {response.status_code}"
        resp_json = response.json()
        # Validate presence of user info, at least id, name, email
        assert isinstance(resp_json, dict), "Response is not a JSON object"
        assert "id" in resp_json or "user" in resp_json, "Response missing 'id' or 'user'"
        # Capture user id for cleanup if available
        if "id" in resp_json:
            user_id = resp_json["id"]
        elif "user" in resp_json and "id" in resp_json["user"]:
            user_id = resp_json["user"]["id"]
        assert resp_json.get("name", resp_json.get("user", {}).get("name")) == valid_user["name"]
        assert resp_json.get("email", resp_json.get("user", {}).get("email")) == valid_user["email"]

        # Test invalid signups
        for invalid_user in invalid_users:
            resp = requests.post(signup_url, json=invalid_user, headers=HEADERS, timeout=TIMEOUT)
            # We expect 4xx client error status codes for invalid data
            assert 400 <= resp.status_code < 500, f"Expected 4xx status code for invalid data, got {resp.status_code}"
    finally:
        # If the API has a delete user endpoint, we would call it here to clean up the created user
        # However, it is not specified in the PRD so this cleanup step is omitted
        pass


test_signup_with_valid_and_invalid_data()