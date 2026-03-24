import requests

def test_fetch_kp_index():
    base_url = "http://localhost:8001"
    url = f"{base_url}/api/weather/kp-index"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        # Validate the response contains a numeric Kp value
        # Assuming the Kp index is returned in a JSON object like: {"kp_index": 3}
        assert isinstance(data, dict), "Response is not a JSON object"
        assert "kp_index" in data, "kp_index key missing in response"
        kp_value = data["kp_index"]
        assert isinstance(kp_value, (int, float)), "kp_index is not numeric"
        assert 0 <= kp_value <= 9, "kp_index value out of expected range (0-9)"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError as e:
        assert False, f"Response not valid JSON: {e}"

test_fetch_kp_index()