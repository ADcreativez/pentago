import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

appjs = appjs.replace("} else if (type.startsWith('tech_')) {", "} else if (type.startsWith('tech_') || type.startsWith('kc_')) {")

appjs = appjs.replace("|| node.type.startsWith('tech_')) {", "|| node.type.startsWith('tech_') || node.type.startsWith('kc_')) {")

appjs = appjs.replace("else if (node.type.startsWith('tech_')) {", "else if (node.type.startsWith('tech_') || node.type.startsWith('kc_')) {")

appjs = appjs.replace("if (node.type.startsWith('tech_')) {", "if (node.type.startsWith('tech_') || node.type.startsWith('kc_')) {")

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for kc_ prefix")
