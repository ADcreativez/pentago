import re

with open('/Users/macbookpro/.gemini/antigravity-ide/brain/e5e1c834-829a-421d-abd5-7e12c58643ae/task.md', 'r') as f:
    content = f.read()

content = content.replace("[ ]", "[x]")
content = content.replace("[/]", "[x]")

with open('/Users/macbookpro/.gemini/antigravity-ide/brain/e5e1c834-829a-421d-abd5-7e12c58643ae/task.md', 'w') as f:
    f.write(content)
