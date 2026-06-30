import re

with open('templates/index.html', 'r') as f:
    content = f.read()

content = content.replace("App Versions</button>", "Change Log</button>")

with open('templates/index.html', 'w') as f:
    f.write(content)
