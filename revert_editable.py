import sys

file_path = 'static/js/app.js'
with open(file_path, 'r') as f:
    content = f.read()

# Revert sec
bad_sec = "? `<div id=\"editor-${sec.id}\" class=\"form-control\" contenteditable=\"true\" style=\"overflow-y:auto; height: 250px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px; background: white;\">${sec.content || ''}</div>`"
good_sec = "? `<textarea id=\"editor-${sec.id}\" class=\"form-control\" style=\"font-family:monospace; font-size:12px; height: 250px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px;\" onchange=\"updateReportSectionContent('${sec.id}', this.value)\">${sec.content || ''}</textarea>`"

# Revert sub
bad_sub = "? `<div id=\"editor-${sub.id}\" class=\"form-control\" contenteditable=\"true\" style=\"overflow-y:auto; height: 200px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px; background: white;\">${sub.content || ''}</div>`"
good_sub = "? `<textarea id=\"editor-${sub.id}\" class=\"form-control\" style=\"font-family:monospace; font-size:12px; height: 200px; width:100%; border:1px solid #cbd5e1; border-radius:4px; padding:8px;\" onchange=\"updateReportSectionContent('${sub.id}', this.value)\">${sub.content || ''}</textarea>`"

# Revert wsToggleEdit
bad_ws = """                const ta = document.getElementById('editor-' + id);
                if (ta) {
                    newContent = ta.hasAttribute('contenteditable') ? ta.innerHTML : ta.value;
                }"""
good_ws = """                const ta = document.getElementById('editor-' + id);
                if (ta) newContent = ta.value;"""

if bad_sec in content:
    content = content.replace(bad_sec, good_sec)
    print("Reverted sec")
if bad_sub in content:
    content = content.replace(bad_sub, good_sub)
    print("Reverted sub")
if bad_ws in content:
    content = content.replace(bad_ws, good_ws)
    print("Reverted wsToggleEdit")

with open(file_path, 'w') as f:
    f.write(content)
