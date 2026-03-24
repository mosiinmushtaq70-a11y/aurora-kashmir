import requests

BASE_URL = "http://localhost:8001"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_register_alert_subscription():
    url = f"{BASE_URL}/api/alerts/subscribe"
    payload = {
        "email": "testuser@example.com"
    }
    try:
        response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200 or response.status_code == 201, f"Unexpected status code: {response.status_code}"
        json_response = response.json()
        assert isinstance(json_response, dict), "Response is not a JSON object"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_register_alert_subscription()