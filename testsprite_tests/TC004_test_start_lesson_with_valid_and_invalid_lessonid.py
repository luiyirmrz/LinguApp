import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30

def test_start_lesson_with_valid_and_invalid_lessonid():
    # First, get a valid lessonId to test with
    try:
        lessons_resp = requests.get(f"{BASE_URL}/lessons", timeout=TIMEOUT)
        lessons_resp.raise_for_status()
        lessons = lessons_resp.json()
        assert isinstance(lessons, list), "Lessons response should be a list"
        assert len(lessons) > 0, "No lessons available to test"

        valid_lesson_id = lessons[0].get("lessonId")
        assert valid_lesson_id and isinstance(valid_lesson_id, str), "Invalid lessonId from lessons list"

        # Test starting lesson with valid lessonId
        start_resp = requests.post(f"{BASE_URL}/lessons/{valid_lesson_id}/start", timeout=TIMEOUT)
        assert start_resp.status_code == 200, f"Expected 200 for valid lessonId, got {start_resp.status_code}"

        # Test starting lesson with an invalid format lessonId (e.g. empty string)
        invalid_lesson_ids = ["", "invalidLesson123", "00000000-0000-0000-0000-000000000000"]
        for invalid_id in invalid_lesson_ids:
            resp = requests.post(f"{BASE_URL}/lessons/{invalid_id}/start", timeout=TIMEOUT)
            # Expect error status codes (400 or 404) for invalid lessonId
            assert resp.status_code in {400, 404}, f"Expected 400 or 404 for invalid lessonId '{invalid_id}', got {resp.status_code}"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except AssertionError as e:
        assert False, f"Assertion failed: {e}"

test_start_lesson_with_valid_and_invalid_lessonid()