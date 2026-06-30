import esprima
import sys

try:
    with open('static/js/app.js', 'r') as f:
        content = f.read()
    esprima.parseScript(content)
    print("Syntax OK")
except Exception as e:
    print("Syntax Error:", e)
