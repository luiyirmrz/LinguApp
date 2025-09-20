import requests
from requests.exceptions import RequestException, Timeout

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30  # seconds


def test_speech_to_text_conversion():
    url = f"{BASE_URL}/speech/recognize"
    headers = {}
    # Prepare a small valid WAV audio data (1-second silent audio)
    valid_audio_content = (
        b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x40\x1f\x00\x00\x80>"  # header part (partial)
        b"\x00\x00\x00\x00\x00\x00data\x00\x00\x00\x00"
    )
    files_valid = {'audio': ('test.wav', valid_audio_content, 'audio/wav')}

    # Test 1: Valid audio file upload
    try:
        response = requests.post(url, files=files_valid, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        json_data = response.json()
        assert "text" in json_data, "Response JSON missing 'text' field"
        assert isinstance(json_data["text"], str), "'text' field is not a string"
        assert "confidence" in json_data, "Response JSON missing 'confidence' field"
        confidence = json_data["confidence"]
        assert isinstance(confidence, (float, int)), "'confidence' field is not a number"
        assert 0.0 <= confidence <= 1.0, "'confidence' is out of range 0.0 to 1.0"
    except (RequestException, Timeout, AssertionError) as e:
        raise AssertionError(f"Valid audio upload failed: {e}")

    # Test 2: Invalid audio file upload (e.g., wrong file type or corrupted data)
    files_invalid = {'audio': ('test.txt', b'This is not audio data', 'text/plain')}
    try:
        response = requests.post(url, files=files_invalid, headers=headers, timeout=TIMEOUT)
        # Either service returns 4xx or 422 or 200 with error fields, handle accordingly
        assert response.status_code != 500, "Server error on invalid audio input"
        if response.status_code == 200:
            json_data = response.json()
            # Assuming invalid audio would not return text and confidence properly
            text = json_data.get("text", None)
            confidence = json_data.get("confidence", None)
            assert (text is None or text == "") or (confidence is None or confidence == 0), \
                "Invalid audio should not produce valid text or confidence"
        else:
            assert 400 <= response.status_code < 500, "Expected client error status for invalid audio"
    except (RequestException, Timeout, AssertionError) as e:
        raise AssertionError(f"Invalid audio upload handling failed: {e}")

    # Test 3: Missing audio file (empty multipart/form-data request)
    try:
        # Send no files part
        response = requests.post(url, files={}, headers=headers, timeout=TIMEOUT)
        # Expecting 4xx error due to missing required audio file
        assert response.status_code != 500, "Server error on missing audio input"
        assert 400 <= response.status_code < 500, "Expected client error status for missing audio"
    except (RequestException, Timeout, AssertionError) as e:
        raise AssertionError(f"Missing audio handling failed: {e}")


test_speech_to_text_conversion()