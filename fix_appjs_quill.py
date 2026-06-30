import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Replace the old chapter editor logic at the bottom of the file
old_logic_regex = r"// ==========================================\n// Workspace Chapter Editor Logic\n// ==========================================.*?alert\('Error: ' \+ e\.message\);\n    }\n};"

new_logic = """// ==========================================
// Workspace Chapter Editor Logic (Always-On WordPress Style)
// ==========================================
window.chapterEditors = {};

window.saveAllEditors = async function() {
    if (!currentProjectId || !window.currentTechReport) return;
    
    // Iterate and grab content from each initialized Quill editor
    window.currentTechReport.forEach(sec => {
        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                const q = window.chapterEditors['editor-' + sub.id];
                if (q) {
                    const htmlContent = q.root.innerHTML === '<p><br></p>' ? '' : q.root.innerHTML;
                    sub.content = htmlContent;
                }
            });
        }
    });
    
    const payload = {
        technical_report: JSON.stringify(window.currentTechReport)
    };
    
    try {
        const res = await fetch(`/api/projects/${currentProjectId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert('Semua perubahan berhasil disimpan!');
            viewProject(currentProjectId);
        } else {
            alert('Gagal menyimpan Laporan.');
        }
    } catch(e) {
        alert('Error: ' + e.message);
    }
};

window.initWorkspaceEditors = function() {
    if (!window.currentTechReport) return;
    
    // WordPress-style full toolbar options
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        ['clean']                                         // remove formatting button
    ];

    window.currentTechReport.forEach(sec => {
        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                const editorId = 'editor-' + sub.id;
                const container = document.getElementById(editorId);
                if (container && !window.chapterEditors[editorId]) {
                    window.chapterEditors[editorId] = new Quill('#' + editorId, {
                        theme: 'snow',
                        modules: {
                            toolbar: toolbarOptions
                        }
                    });
                    if (sub.content) {
                        window.chapterEditors[editorId].root.innerHTML = sub.content;
                    }
                }
            });
        }
    });
};
"""

content = re.sub(old_logic_regex, new_logic.strip(), content, flags=re.DOTALL)

with open('static/js/app.js', 'w') as f:
    f.write(content)
