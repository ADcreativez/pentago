import re

with open('templates/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of page-content
start_idx = content.find('<div id="page-content">')
if start_idx == -1:
    print("Could not find <div id=\"page-content\">")
    exit(1)

# Finding the closing tag for page-content is tricky because of nested divs.
# But we know that all scripts and modals come after page-content closes.
# Let's find the first <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
script_idx = content.find('<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>')
if script_idx == -1:
    print("Could not find scripts")
    exit(1)

# We need to find the </div> that closes page-content before script_idx.
# It should be the </div> right before <div id="login-overlay"> or similar? No, login is at top.
# Let's look at the content just before scripts.
pre_script = content[:script_idx]
# We'll just split it:
# base.html will have:
# {% block head %}{% endblock %} inside <head> if needed
# 
# Wait, actually let's just make base.html have the full shell, and a block `content`.
# If index.html becomes just {% extends "base.html" %} {% block content %} ... {% endblock %}, 
# we can move the inner contents of page-content to index.html's block content.
# But wait, index.html currently has modals after page-content, and scripts.
# We should probably keep all scripts and modals in base.html for now to not break the SPA!
# So index.html will ONLY contain the inner HTML of <div id="page-content">.

page_content_start = start_idx + len('<div id="page-content">\n')

# Find the matching closing div for page-content.
div_count = 0
in_page_content = False
end_idx = -1

for i in range(start_idx, script_idx):
    if content[i:i+4] == '<div':
        div_count += 1
    elif content[i:i+5] == '</div':
        div_count -= 1
        if div_count == 0:
            end_idx = i
            break

if end_idx == -1:
    print("Could not find closing div")
    exit(1)

base_html = content[:start_idx] + '<div id="page-content">\n    {% block content %}\n    {% endblock %}\n</div>\n' + content[end_idx+6:]

index_html_new = '{% extends "base.html" %}\n{% block content %}\n' + content[page_content_start:end_idx] + '\n{% endblock %}\n'

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(base_html)

with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(index_html_new)

print("Successfully split index.html into base.html and index.html")
