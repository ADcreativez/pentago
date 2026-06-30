with open('app.py', 'r') as f:
    lines = f.readlines()

# Remove line 372
lines.pop(371) # 0-indexed

# Add "class Project(db.Model):" at line 393
lines[392] = "class Project(db.Model):\n"

with open('app.py', 'w') as f:
    f.writelines(lines)
