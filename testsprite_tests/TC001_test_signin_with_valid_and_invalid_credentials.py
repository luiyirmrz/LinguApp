import requests
import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_signin_with_valid_and_invalid_credentials():
    signin_url = f"{BASE_URL}/auth/signin"

    # Valid credentials from environment variables - secure approach
    valid_email = os.getenv("TEST_VALID_EMAIL", "test@example.com")
    valid_password = os.getenv("TEST_VALID_PASSWORD", "password123")

    # Invalid credentials examples
    invalid_email = "invaliduser@example.com"
    invalid_password = "wrongpassword"

    # Test with valid credentials
    valid_payload = {
        "email": valid_email,
        "password": valid_password
    }
    try:
        res_valid = requests.post(signin_url, json=valid_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with valid credentials failed: {e}"

    # On success, expect 200 OK and JSON with user and token
    assert res_valid.status_code == 200, f"Expected 200 for valid credentials but got {res_valid.status_code}"
    try:
        json_data = res_valid.json()
    except ValueError:
        assert False, "Response for valid credentials is not valid JSON"

    assert "user" in json_data, "'user' field missing in valid signin response"
    assert isinstance(json_data["user"], dict), "'user' field is not an object"
    assert "token" in json_data, "'token' field missing in valid signin response"
    assert isinstance(json_data["token"], str) and len(json_data["token"]) > 0, "Invalid 'token' value"

    # Test with invalid credentials - invalid email, valid password
    invalid_email_payload = {
        "email": invalid_email,
        "password": valid_password
    }
    try:
        res_invalid_email = requests.post(signin_url, json=invalid_email_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with invalid email failed: {e}"

    # Expected: not 200; usually 401 or 400; response with error message
    assert res_invalid_email.status_code != 200, "Signin succeeded with invalid email, expected failure"

    # Test with invalid credentials - valid email, invalid password
    invalid_password_payload = {
        "email": valid_email,
        "password": invalid_password
    }
    try:
        res_invalid_password = requests.post(signin_url, json=invalid_password_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with invalid password failed: {e}"

    assert res_invalid_password.status_code != 200, "Signin succeeded with invalid password, expected failure"

    # Optionally check error response structure or messages if present
    for res in [res_invalid_email, res_invalid_password]:
        try:
            json_error = res.json()
            assert isinstance(json_error, dict), "Error response is not a JSON object"
            # May have error message or code - we don't have schema but check for typical fields
            has_error_msg = any(key in json_error for key in ["error", "message", "detail"])
            assert has_error_msg or len(json_error) == 0, "Error response does not contain error info"
        except ValueError:
            # Some servers may return empty body on error
            pass


test_signin_with_valid_and_invalid_credentials()
