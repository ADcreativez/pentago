import re
with open('static/css/style.css', 'r') as f:
    css = f.read()

# find all blocks with display: flex
blocks = re.findall(r'([^{]+)\{[^}]*display\s*:\s*flex[^}]*\}', css)
for b in blocks:
    print(b.strip())
