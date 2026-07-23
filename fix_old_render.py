import sys

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Remove the combined rendering logic from renderProjectThreatModels if it exists
# Let's see if the old logic had type badge...
# It did. Let's filter out 'killchain' diagrams before rendering in renderProjectThreatModels!

old_render = """    diagrams.forEach((diag, idx) => {"""
new_render = """    diagrams.filter(d => d.type !== 'killchain').forEach((diag, idx) => {"""

content = content.replace(old_render, new_render, 1)

with open('static/js/app.js', 'w') as f:
    f.write(content)

print("Done")
