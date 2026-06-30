import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Add init call at the end of viewProject
if 'window.initWorkspaceEditors();' not in content:
    content = content.replace("document.getElementById('project-detail-view').style.display = 'block';", 
                              "document.getElementById('project-detail-view').style.display = 'block';\n    setTimeout(() => {\n        if (typeof window.initWorkspaceEditors === 'function') window.initWorkspaceEditors();\n    }, 300);")

with open('static/js/app.js', 'w') as f:
    f.write(content)
