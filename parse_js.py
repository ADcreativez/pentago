import esprima
with open('static/js/preview_builder.js', 'r') as f:
    js = f.read()
try:
    esprima.parseScript(js)
    print("Syntax OK")
except Exception as e:
    print(f"Syntax Error: {e}")
