import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Replace the array check
old_check = "if (!techReport || techReport.length === 0) techReport = defaultStructure;"
new_check = "if (!Array.isArray(techReport) || techReport.length === 0) techReport = defaultStructure;"

content = content.replace(old_check, new_check)

with open('static/js/app.js', 'w') as f:
    f.write(content)
