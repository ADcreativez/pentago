from py_mini_racer import MiniRacer
ctx = MiniRacer()
with open('static/js/app.js', 'r') as f:
    js_code = f.read()
try:
    ctx.eval(js_code)
    print("Syntax OK")
except Exception as e:
    print(str(e)[:500])
