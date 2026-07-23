with open('templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

workspace_html = '{% extends "base.html" %}\n{% block content %}\n' + "".join(lines[289:454]) + '{% endblock %}\n'
with open('templates/workspace.html', 'w', encoding='utf-8') as f:
    f.write(workspace_html)
print("SUCCESS")
