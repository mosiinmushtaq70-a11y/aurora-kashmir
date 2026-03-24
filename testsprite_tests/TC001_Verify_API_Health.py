import requests

def test_verify_api_health():
    url = "http://localhost:8001/api/health"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        assert response.status_code == 200
        assert response.text.lower() == "ok" or response.json().get("status", "").lower() == "ok"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_verify_api_health()