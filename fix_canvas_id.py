import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_canvas = """    const canvas = document.getElementById('threat-model-canvas');"""
new_canvas = """    const canvas = document.getElementById('studio-canvas');"""
appjs = appjs.replace(old_canvas, new_canvas)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for canvas id")
