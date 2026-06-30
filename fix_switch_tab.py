with open('static/js/app.js', 'r') as f:
    content = f.read()

# Insert into switchTab
if "tab === 'report-templates'" not in content:
    target = "} else if (tab === 'testing-guide') {"
    replacement = "} else if (tab === 'report-templates') {\n        document.getElementById('report-templates-view').style.display = 'block';\n        loadReportTemplates();\n    } else if (tab === 'testing-guide') {"
    content = content.replace(target, replacement)

with open('static/js/app.js', 'w') as f:
    f.write(content)
