import urllib.request
import urllib.parse
import json
import http.cookiejar

try:
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    
    # login
    login_data = json.dumps({'username': 'admin', 'password': 'password'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:5001/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    with opener.open(req) as f:
        print("Login:", f.status, f.read().decode('utf-8'))
        
    # fetch dashboard
    req2 = urllib.request.Request('http://127.0.0.1:5001/api/dashboard?year=all')
    with opener.open(req2) as f:
        print("Dashboard:", f.status)
        data = f.read().decode('utf-8')
        print(data[:500])
        
    # fetch projects
    req3 = urllib.request.Request('http://127.0.0.1:5001/api/projects')
    with opener.open(req3) as f:
        print("Projects:", f.status)
        data = f.read().decode('utf-8')
        print(len(json.loads(data)), "projects found")
        
except Exception as e:
    print(f"Error: {e}")
