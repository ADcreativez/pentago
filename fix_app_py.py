import re

with open('app.py', 'r') as f:
    content = f.read()

# I need to put back exactly ONE `class Project(db.Model):` right before `id = db.Column(db.Integer, primary_key=True)` that belongs to Project
# How do I know which one?
# Let's search for the Project's id column
content = content.replace("    id = db.Column(db.Integer, primary_key=True)\n    name = db.Column(db.String(255)", "class Project(db.Model):\n    id = db.Column(db.Integer, primary_key=True)\n    name = db.Column(db.String(255)")

with open('app.py', 'w') as f:
    f.write(content)
