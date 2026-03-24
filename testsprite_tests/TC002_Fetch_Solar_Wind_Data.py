import requests

def test_fetch_solar_wind_data():
    url = "http://localhost:8001/api/weather/forecast/global"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    assert isinstance(data, dict), "Response JSON is not an object"

test_fetch_solar_wind_data()
