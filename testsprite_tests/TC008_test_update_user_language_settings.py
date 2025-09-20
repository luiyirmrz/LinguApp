import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30

def test_update_user_language_settings():
    url = f"{BASE_URL}/user/language-settings"
    headers = {
        "Content-Type": "application/json"
    }

    # Valid update payload
    valid_payload = {
        "mainLanguage": "en",
        "targetLanguage": "fr",
        "showTranslations": True,
        "showPhonetics": False
    }

    try:
        # Test valid update
        response = requests.put(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        resp_json = response.json()
        for key, value in valid_payload.items():
            assert key in resp_json, f"Response missing '{key}'"
            assert resp_json[key] == value, f"Expected {key}={value}, got {resp_json[key]}"

        # Invalid payloads to test error handling
        invalid_payloads = [
            {},  # empty
            {"mainLanguage": 123, "targetLanguage": "fr", "showTranslations": True, "showPhonetics": False},  # mainLanguage wrong type
            {"mainLanguage": "en", "targetLanguage": None, "showTranslations": True, "showPhonetics": False},  # targetLanguage null
            {"mainLanguage": "en", "targetLanguage": "fr", "showTranslations": "yes", "showPhonetics": False},  # showTranslations wrong type
            {"mainLanguage": "en", "targetLanguage": "fr", "showTranslations": True},  # missing showPhonetics
        ]

        for idx, inval_payload in enumerate(invalid_payloads, start=1):
            r = requests.put(url, json=inval_payload, headers=headers, timeout=TIMEOUT)
            assert r.status_code >= 400 and r.status_code < 500, f"Invalid payload {idx} expected 4xx error, got {r.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_update_user_language_settings()