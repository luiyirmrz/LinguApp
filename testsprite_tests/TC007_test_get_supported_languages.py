import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30

def test_get_supported_languages():
    url = f"{BASE_URL}/languages"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /languages request failed: {e}"

    try:
        languages = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(languages, list), "Response should be a list"

    required_keys = {"code", "name", "nativeName", "flag"}
    for lang in languages:
        assert isinstance(lang, dict), "Each language entry should be a dict"
        lang_keys = set(lang.keys())
        assert required_keys.issubset(lang_keys), \
            f"Language object missing required keys: {required_keys - lang_keys}"
        assert isinstance(lang["code"], str) and lang["code"], "Language code must be a non-empty string"
        assert isinstance(lang["name"], str) and lang["name"], "Language name must be a non-empty string"
        assert isinstance(lang["nativeName"], str) and lang["nativeName"], "nativeName must be a non-empty string"
        assert isinstance(lang["flag"], str) and lang["flag"], "Flag must be a non-empty string"

    # Validate the known supported languages are included and non-empty
    expected_language_codes = {"en", "es", "fr", "it", "hr", "zh"}
    found_codes = {lang["code"] for lang in languages}
    missing_codes = expected_language_codes - found_codes
    assert not missing_codes, f"Missing expected language codes: {missing_codes}"

test_get_supported_languages()