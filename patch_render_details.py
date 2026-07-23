import sys

with open('static/js/app.js', 'r') as f:
    content = f.read()

# I need to find the block in app.js that renders the threat-models-container.
# Let's first search for where 'project-threat-models-container' is used.
