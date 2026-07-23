with open('templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

dashboard_html = '{% extends "base.html" %}\n{% block content %}\n' + "".join(lines[2:96]) + '{% endblock %}\n'
with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(dashboard_html)
print("SUCCESS")
