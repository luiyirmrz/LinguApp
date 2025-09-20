import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30

def test_get_user_achievements_list():
    url = f"{BASE_URL}/gamification/achievements"
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to /gamification/achievements failed: {e}"

    data = response.json()

    assert isinstance(data, list), "Response is not a list of achievements"

    # Each achievement object should have id (str), name (str), description (str), icon (str), unlocked (bool)
    for achievement in data:
        assert isinstance(achievement, dict), "Achievement item is not a dictionary"
        assert "id" in achievement and isinstance(achievement["id"], str), "Achievement missing 'id' or not a string"
        assert "name" in achievement and isinstance(achievement["name"], str), "Achievement missing 'name' or not a string"
        assert "description" in achievement and isinstance(achievement["description"], str), "Achievement missing 'description' or not a string"
        assert "icon" in achievement and isinstance(achievement["icon"], str), "Achievement missing 'icon' or not a string"
        assert "unlocked" in achievement and isinstance(achievement["unlocked"], bool), "Achievement missing 'unlocked' or not a boolean"

test_get_user_achievements_list()