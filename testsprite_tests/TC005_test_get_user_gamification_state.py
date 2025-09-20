import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30  # seconds

def test_get_user_gamification_state():
    url = f"{BASE_URL}/gamification/state"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    json_data = response.json()

    assert isinstance(json_data, dict), "Response is not a JSON object"
    # Validate presence and type of each required field according to schema
    expected_fields = {
        "xp": int,
        "level": int,
        "streak": int,
        "hearts": int,
        "gems": int,
        "achievements": list
    }
    for field, expected_type in expected_fields.items():
        assert field in json_data, f"Missing field '{field}' in response"
        assert isinstance(json_data[field], expected_type), f"Field '{field}' is not of type {expected_type.__name__}"

    # Validate achievements array items are strings
    for achievement in json_data["achievements"]:
        assert isinstance(achievement, str), "Achievement item is not a string"

test_get_user_gamification_state()
