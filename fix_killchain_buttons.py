import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_edit = """onclick="editThreatModelDiagram('${diag.id}', '${type}')\""""
new_edit = """onclick="openThreatModelStudio('${diag.id}', '${diag.name}', '${type}')\""""

old_del = """onclick="deleteThreatModelDiagram('${diag.id}', '${type}')\""""
new_del = """onclick="deleteThreatModelDiagram('${diag.id}')\""""

appjs = appjs.replace(old_edit, new_edit)
appjs = appjs.replace(old_del, new_del)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js patched")
