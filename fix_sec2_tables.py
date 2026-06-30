import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

old_logic = """        if (!sec2.content) {"""
new_logic = """        if (!sec2.content || !sec2.content.includes('<table')) {"""

content = content.replace(old_logic, new_logic)

old_logic2 = """        if (!sub21.content) {"""
new_logic2 = """        if (!sub21.content || !sub21.content.includes('<table')) {"""

content = content.replace(old_logic2, new_logic2)

with open('static/js/app.js', 'w') as f:
    f.write(content)
