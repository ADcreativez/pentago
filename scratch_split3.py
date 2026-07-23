with open('templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find exact index for '<div id="page-content">'
start_idx = -1
for i, line in enumerate(lines):
    if '<div id="page-content">' in line:
        start_idx = i
        break

# find exact index for '<!-- Reference Category Modal -->'
modal_idx = -1
for i, line in enumerate(lines):
    if '<!-- Reference Category Modal -->' in line:
        modal_idx = i
        break

if start_idx != -1 and modal_idx != -1:
    # the closing div for page-content should be just before modal_idx (skip empty lines)
    end_idx = modal_idx - 1
    while end_idx > start_idx and lines[end_idx].strip() == '':
        end_idx -= 1
    
    # end_idx should now point to a '</div>'
    print(f"Start: {start_idx}, End: {end_idx}")
    print("Content of end_idx:", lines[end_idx].strip())
    
    base_html = "".join(lines[:start_idx]) + '          <div id="page-content">\n              {% block content %}\n              {% endblock %}\n          </div>\n' + "".join(lines[end_idx+1:])
    index_html = '{% extends "base.html" %}\n{% block content %}\n' + "".join(lines[start_idx+1:end_idx]) + '\n{% endblock %}\n'
    
    with open('templates/base.html', 'w', encoding='utf-8') as f:
        f.write(base_html)
    with open('templates/index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("SUCCESS")
