import re
with open('app.py', 'r') as f:
    content = f.read()

if 'import logging' not in content:
    content = "import logging\nlogging.basicConfig(filename='flask_error.log', level=logging.DEBUG)\n" + content
    with open('app.py', 'w') as f:
        f.write(content)
