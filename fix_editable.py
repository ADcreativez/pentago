import sys

file_path = 'static/js/app.js'
with open(file_path, 'r') as f:
    content = f.read()

# Replace textarea with contenteditable div for sec
old_sec = "? `<textarea id=\"editor-${sec.id}\" class=\"form-control\" style=\"font-family:monospace; font-size:12px; height: 250px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px;\" onchange=\"updateReportSectionContent('${sec.id}', this.value)\">${sec.content || ''}</textarea>`"
new_sec = "? `<div id=\"editor-${sec.id}\" class=\"form-control\" contenteditable=\"true\" style=\"overflow-y:auto; height: 250px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px; background: white;\">${sec.content || ''}</div>`"

# Replace textarea with contenteditable div for sub
old_sub = "? `<textarea id=\"editor-${sub.id}\" class=\"form-control\" style=\"font-family:monospace; font-size:12px; height: 200px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px;\" onchange=\"updateReportSectionContent('${sub.id}', this.value)\">${sub.content || ''}</textarea>`"
new_sub = "? `<div id=\"editor-${sub.id}\" class=\"form-control\" contenteditable=\"true\" style=\"overflow-y:auto; height: 200px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px; background: white;\">${sub.content || ''}</div>`"

# Fix wsToggleEdit
old_ws = """                const ta = document.getElementById('editor-' + id);
                if (ta) newContent = ta.value;"""
new_ws = """                const ta = document.getElementById('editor-' + id);
                if (ta) {
                    newContent = ta.hasAttribute('contenteditable') ? ta.innerHTML : ta.value;
                }"""

if old_sec in content:
    content = content.replace(old_sec, new_sec)
    print("Replaced sec")
if old_sub in content:
    content = content.replace(old_sub, new_sub)
    print("Replaced sub")
if old_ws in content:
    content = content.replace(old_ws, new_ws)
    print("Replaced wsToggleEdit")

with open(file_path, 'w') as f:
    f.write(content)
