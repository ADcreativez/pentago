with open('templates/base.html', 'r', encoding='utf-8') as f:
    base_content = f.read()

# Remove dictionary-id-en.js from base.html
base_content = base_content.replace('<script src="{{ url_for(\'static\', filename=\'js/dictionary-id-en.js\') }}?v=1.6.0"></script>\n', '')

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(base_content)

with open('templates/workspace.html', 'r', encoding='utf-8') as f:
    workspace_content = f.read()

# Add dictionary-id-en.js to workspace.html
workspace_content = workspace_content.replace('{% block content %}\n', '{% block content %}\n<script src="{{ url_for(\'static\', filename=\'js/dictionary-id-en.js\') }}?v=1.6.0"></script>\n')

with open('templates/workspace.html', 'w', encoding='utf-8') as f:
    f.write(workspace_content)

print("SUCCESS")
