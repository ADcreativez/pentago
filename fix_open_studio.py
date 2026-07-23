import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_load = """            .then(p => {
                let diagrams = [];
                if (p.threat_model) {
                    const cleaned = p.threat_model.trim();"""
new_load = """            .then(p => {
                let diagrams = [];
                const targetField = type === 'killchain' ? p.cyber_kill_chain : p.threat_model;
                if (targetField) {
                    const cleaned = targetField.trim();"""
appjs = appjs.replace(old_load, new_load)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched for openThreatModelStudio load data")
