import urllib.request
import json

try:
    req = urllib.request.Request('http://127.0.0.1:5001/api/projects')
    # Since it requires login, we will probably get a 401 or redirect.
    # Let's just check if the server is running and what it returns.
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"URLError: {e}")
except Exception as e:
    print(f"Error: {e}")
