import re

with open('templates/index.html.bak', 'r') as f:
    content = f.read()

# Find the threat-model-view block
start_idx = content.find('<div id="threat-model-view"')
if start_idx == -1:
    print("Not found!")
    exit(1)

# Find the end of the block. It ends right before "<!-- Threats Manager Section -->"
end_idx = content.find('<!-- Threats Manager Section -->', start_idx)

if end_idx == -1:
    print("End not found!")
    exit(1)

threat_model_html = content[start_idx:end_idx].strip()

# Now read workspace.html
with open('templates/workspace.html', 'r') as f:
    ws_content = f.read()

# Insert it before {% endblock %}
ws_content = ws_content.replace('<!-- Threat Modelling Studio View -->', '<!-- Threat Modelling Studio View -->\n            ' + threat_model_html + '\n')

with open('templates/workspace.html', 'w') as f:
    f.write(ws_content)

print("Successfully injected threat-model-view into workspace.html")
