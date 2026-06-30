import re
with open('static/js/app.js', 'r') as f:
    content = f.read()

if "id: 'report-templates'" not in content:
    content = content.replace("{ id: 'testing-guide', label: 'Testing Guide', icon: '📖', adminOnly: false },", "{ id: 'report-templates', label: 'Report Templates', icon: '📄', adminOnly: false },\n    { id: 'testing-guide', label: 'Testing Guide', icon: '📖', adminOnly: false },")

with open('static/js/app.js', 'w') as f:
    f.write(content)
