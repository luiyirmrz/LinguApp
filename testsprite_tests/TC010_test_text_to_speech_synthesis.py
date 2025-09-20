import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_text_to_speech_synthesis():
    synthesize_url = f"{BASE_URL}/speech/synthesize"

    # Valid test case: Provide all required fields with valid values
    valid_payload = {
        "text": "Hello, world!",
        "language": "en",
        "voice": "default"
    }
    try:
        response = requests.post(synthesize_url, json=valid_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        json_resp = response.json()
        assert "audioUrl" in json_resp, "Response JSON missing 'audioUrl'"
        assert isinstance(json_resp["audioUrl"], str) and json_resp["audioUrl"].startswith("http"), \
            "'audioUrl' should be a valid URL string"
    except Exception as e:
        assert False, f"Exception during valid synthesis request: {e}"

    # Test missing 'text' parameter
    missing_text_payload = {
        "language": "en",
        "voice": "default"
    }
    try:
        response = requests.post(synthesize_url, json=missing_text_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code >= 400, "Expected client error status for missing 'text'"
    except Exception as e:
        assert False, f"Exception during missing 'text' request: {e}"

    # Test missing 'language' parameter
    missing_language_payload = {
        "text": "Hello again",
        "voice": "default"
    }
    try:
        response = requests.post(synthesize_url, json=missing_language_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code >= 400, "Expected client error status for missing 'language'"
    except Exception as e:
        assert False, f"Exception during missing 'language' request: {e}"

    # Test missing 'voice' parameter
    missing_voice_payload = {
        "text": "Hello once more",
        "language": "en"
    }
    try:
        response = requests.post(synthesize_url, json=missing_voice_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code >= 400, "Expected client error status for missing 'voice'"
    except Exception as e:
        assert False, f"Exception during missing 'voice' request: {e}"

    # Test invalid language code
    invalid_language_payload = {
        "text": "Bonjour",
        "language": "xx-invalid",
        "voice": "default"
    }
    try:
        response = requests.post(synthesize_url, json=invalid_language_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code >= 400, "Expected client error status for invalid 'language' value"
    except Exception as e:
        assert False, f"Exception during invalid 'language' request: {e}"

    # Test invalid voice value
    invalid_voice_payload = {
        "text": "Hola",
        "language": "es",
        "voice": "unknown-voice"
    }
    try:
        response = requests.post(synthesize_url, json=invalid_voice_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code >= 400, "Expected client error status for invalid 'voice' value"
    except Exception as e:
        assert False, f"Exception during invalid 'voice' request: {e}"


test_text_to_speech_synthesis()