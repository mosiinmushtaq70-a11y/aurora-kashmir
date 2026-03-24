import requests

BASE_URL = "http://localhost:8001"
TIMEOUT = 30

def test_fetch_historical_telemetry():
    url = f"{BASE_URL}/api/weather/telemetry/history"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate presence of expected keys in the response indicating Kp index and telemetry data
    # Since schema details are not provided explicitly, check for typical keys presence
    assert isinstance(data, dict) or isinstance(data, list), "Response JSON must be a dict or list"
    if isinstance(data, dict):
        assert 'kp_index' in data or 'telemetry' in data or len(data) > 0, "Expected Kp index or telemetry data in response"
    elif isinstance(data, list):
        assert len(data) > 0, "Response list is empty, expected historical telemetry data"

test_fetch_historical_telemetry()