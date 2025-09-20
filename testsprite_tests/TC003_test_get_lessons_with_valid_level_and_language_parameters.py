import requests

import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8081")
TIMEOUT = 30

def test_get_lessons_with_valid_level_and_language_parameters():
    headers = {
        "Accept": "application/json"
    }

    # Valid parameters
    valid_level = "B1"
    valid_language = "English"
    params_valid = {
        "level": valid_level,
        "language": valid_language
    }

    try:
        # Test with valid level and language parameters
        response = requests.get(
            f"{BASE_URL}/lessons",
            headers=headers,
            params=params_valid,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        lessons = response.json()
        assert isinstance(lessons, list), "Expected response to be a list"
        # Validate that each lesson matches the filter criteria
        for lesson in lessons:
            assert isinstance(lesson, dict), "Each lesson should be a dictionary"
            assert "level" in lesson, "Lesson missing 'level' field"
            assert "title" in lesson, "Lesson missing 'title' field"
            assert "lessonId" in lesson, "Lesson missing 'lessonId' field"
            # Level should match requested level
            assert lesson["level"] == valid_level, f"Lesson level {lesson['level']} does not match requested level {valid_level}"
        # It's possible language check not directly in lesson, no explicit language field in schema, skip that validation here

        # Test with valid level only
        params_level_only = {"level": valid_level}
        response_level_only = requests.get(
            f"{BASE_URL}/lessons",
            headers=headers,
            params=params_level_only,
            timeout=TIMEOUT
        )
        assert response_level_only.status_code == 200
        lessons_level_only = response_level_only.json()
        assert isinstance(lessons_level_only, list)

        # Test with valid language only
        params_language_only = {"language": valid_language}
        response_language_only = requests.get(
            f"{BASE_URL}/lessons",
            headers=headers,
            params=params_language_only,
            timeout=TIMEOUT
        )
        assert response_language_only.status_code == 200
        lessons_language_only = response_language_only.json()
        assert isinstance(lessons_language_only, list)

        # Test with missing parameters (empty)
        response_no_params = requests.get(
            f"{BASE_URL}/lessons",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_no_params.status_code == 200
        lessons_no_params = response_no_params.json()
        assert isinstance(lessons_no_params, list)

        # Test with invalid level parameter
        params_invalid_level = {"level": "Z9", "language": valid_language}
        response_invalid_level = requests.get(
            f"{BASE_URL}/lessons",
            headers=headers,
            params=params_invalid_level,
            timeout=TIMEOUT
        )
        # Depending on API design, could either return 400 or 200 with empty list
        assert response_invalid_level.status_code in (200, 400)
        if response_invalid_level.status_code == 200:
            lessons_invalid_level = response_invalid_level.json()
            assert isinstance(lessons_invalid_level, list)
        else:
            # If error response, check error message json
            try:
                error_json = response_invalid_level.json()
            except Exception:
                error_json = None
            assert error_json is not None, "Error response missing JSON body"

        # Test with invalid language parameter (e.g. numeric)
        params_invalid_language = {"level": valid_level, "language": "1234$%"}
        response_invalid_language = requests.get(
            f"{BASE_URL}/lessons",
            headers=headers,
            params=params_invalid_language,
            timeout=TIMEOUT
        )
        assert response_invalid_language.status_code in (200, 400)
        if response_invalid_language.status_code == 200:
            lessons_invalid_language = response_invalid_language.json()
            assert isinstance(lessons_invalid_language, list)
        else:
            try:
                error_json_lang = response_invalid_language.json()
            except Exception:
                error_json_lang = None
            assert error_json_lang is not None, "Error response missing JSON body"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_lessons_with_valid_level_and_language_parameters()
