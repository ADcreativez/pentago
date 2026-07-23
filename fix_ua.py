import sys

with open('app.py', 'r') as f:
    content = f.read()

old_req = """        response = requests.get(url, stream=True, timeout=10)"""
new_req = """        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'}
        response = requests.get(url, stream=True, timeout=10, headers=headers)"""

content = content.replace(old_req, new_req)

with open('app.py', 'w') as f:
    f.write(content)
print("app.py patched")
