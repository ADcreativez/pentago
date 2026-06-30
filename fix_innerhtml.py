import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Fix the zero findings overwrite
content = content.replace("reportsContainer.innerHTML = '<div style=\"text-align: center;", "reportsContainer.innerHTML += '<div style=\"text-align: center;")

# Fix the findings overwrite
content = content.replace("reportsContainer.innerHTML = reportsHTML;", "reportsContainer.innerHTML += reportsHTML;")

with open('static/js/app.js', 'w') as f:
    f.write(content)

