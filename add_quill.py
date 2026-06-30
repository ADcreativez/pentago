import re

with open('templates/index.html', 'r') as f:
    content = f.read()

# Add quill css in head
if 'quill.snow.css' not in content:
    content = content.replace('</head>', '    <!-- Quill Editor -->\n    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">\n</head>')

# Add quill js before app.js
if 'quill.min.js' not in content:
    content = content.replace('<script src="/static/js/app.js"></script>', '<!-- Quill Editor -->\n    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>\n    <script src="/static/js/app.js"></script>')

with open('templates/index.html', 'w') as f:
    f.write(content)
