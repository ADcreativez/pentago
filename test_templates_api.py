import urllib.request
import json

try:
    req = urllib.request.Request('http://127.0.0.1:5001/api/report_templates')
    req.add_header('Cookie', 'session=ey...;') # We don't have a valid session cookie, so it will redirect to /login
    response = urllib.request.urlopen(req)
    data = response.read().decode('utf-8')
    print("Response code:", response.getcode())
    print("Data:", data[:200])
except Exception as e:
    print("Error:", e)
