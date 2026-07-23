with open('templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<div id="page-content">' in line:
        start_idx = i
        break

# Find the closing tag by looking backwards from the first modal
modal_idx = -1
for i in range(start_idx, len(lines)):
    if '<!-- Reference Category Modal -->' in line or 'class="modal-overlay"' in line:
        modal_idx = i
        break

# The closing </div> for page-content should be just before modal_idx
# Let's count divs from start_idx to find the exact match
div_count = 0
for i in range(start_idx, len(lines)):
    line = lines[i]
    # Simple counting (works well enough for well-formatted HTML if tags don't span multiple lines weirdly)
    div_count += line.count('<div') - line.count('</div')
    if div_count == 0:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    base_html = "".join(lines[:start_idx]) + '          <div id="page-content">\n              {% block content %}\n              {% endblock %}\n          </div>\n' + "".join(lines[end_idx+1:])
    index_html = '{% extends "base.html" %}\n{% block content %}\n' + "".join(lines[start_idx+1:end_idx]) + '\n{% endblock %}\n'
    
    with open('templates/base.html', 'w', encoding='utf-8') as f:
        f.write(base_html)
    with open('templates/index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("SUCCESS")
else:
    print(f"FAILED: start_idx={start_idx}, end_idx={end_idx}")
