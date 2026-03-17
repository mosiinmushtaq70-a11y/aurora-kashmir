import traceback
try:
    import api.main
    print("SUCCESS")
except Exception as e:
    print("Failed to initialize API")
    traceback.print_exc()
