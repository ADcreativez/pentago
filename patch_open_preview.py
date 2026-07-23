with open("static/js/app.js", "r") as f:
    lines = f.readlines()

sync_code = """
    // Sync all active Quill editors to window.currentTechReport before preview
    if (window.currentTechReport && window.chapterEditors) {
        window.currentTechReport.forEach(sec => {
            const editorId = 'editor-' + sec.id;
            if (window.chapterEditors[editorId]) {
                const q = window.chapterEditors[editorId];
                sec.content = q.root.innerHTML === '<p><br></p>' ? '' : q.root.innerHTML;
            } else {
                const ta = document.getElementById(editorId);
                if (ta && ta.tagName === 'TEXTAREA') sec.content = ta.value;
            }
            if (sec.subsections) {
                sec.subsections.forEach(sub => {
                    const subEditorId = 'editor-' + sub.id;
                    if (window.chapterEditors[subEditorId]) {
                        const q = window.chapterEditors[subEditorId];
                        sub.content = q.root.innerHTML === '<p><br></p>' ? '' : q.root.innerHTML;
                    } else {
                        const ta = document.getElementById(subEditorId);
                        if (ta && ta.tagName === 'TEXTAREA') sub.content = ta.value;
                    }
                });
            }
        });
    }
"""

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if "async function openReportPreview(lang = 'id') {" in line:
        new_lines.append(sync_code)

with open("static/js/app.js", "w") as f:
    f.writelines(new_lines)
