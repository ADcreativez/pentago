import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Update viewProject HTML rendering
old_render = """    // Generate Dynamic Cards for each subsection
    techReport.forEach(sec => {
        chaptersHTML += `<h3 style="font-family: var(--font-title); font-size: 1.1rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">${sec.title}</h3>`;
        
        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                chaptersHTML += `
                <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
                    <div class="sysreptor-report-title" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>${sub.title}</span>
                    </div>
                    <div class="card-edit-content" style="padding: 1rem; background: #fafafa; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                        ${canEditProject(p) ? `<div id="editor-${sub.id}" class="wp-editor" style="height: 250px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sub.content || '', {val:0})}</div>`}
                    </div>
                </div>
                `;
            });
        }
    });"""

new_render = """    // Generate Dynamic Cards for each Chapter and Sub-chapter
    techReport.forEach(sec => {
        // Render Editor for Chapter
        chaptersHTML += `
        <div class="sysreptor-report-card" style="margin-bottom: 1rem; border-color: #3b82f6;">
            <div class="sysreptor-report-title" style="display:flex; justify-content:space-between; align-items:center; background: #eff6ff; color: #1e3a8a;">
                <span>${sec.title}</span>
            </div>
            <div class="card-edit-content" style="padding: 1rem; background: #fafafa; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                ${canEditProject(p) ? `<div id="editor-${sec.id}" class="wp-editor" style="height: 250px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sec.content || '', {val:0})}</div>`}
            </div>
        </div>
        `;
        
        // Render Editors for Sub-chapters
        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                chaptersHTML += `
                <div class="sysreptor-report-card" style="margin-bottom: 1.5rem; margin-left: 2.5rem;">
                    <div class="sysreptor-report-title" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>↳ ${sub.title}</span>
                    </div>
                    <div class="card-edit-content" style="padding: 1rem; background: #fafafa; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                        ${canEditProject(p) ? `<div id="editor-${sub.id}" class="wp-editor" style="height: 200px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sub.content || '', {val:0})}</div>`}
                    </div>
                </div>
                `;
            });
        }
    });"""

content = content.replace(old_render, new_render)

# 2. Update saveAllEditors
old_save = """    // Iterate and grab content from each initialized Quill editor
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
    });"""

new_save = """    // Iterate and grab content from each initialized Quill editor
    window.currentTechReport.forEach(sec => {
        // Save Chapter content
        const qSec = window.chapterEditors['editor-' + sec.id];
        if (qSec) {
            const htmlContent = qSec.root.innerHTML === '<p><br></p>' ? '' : qSec.root.innerHTML;
            sec.content = htmlContent;
        }
        // Save Sub-chapter content
        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                const q = window.chapterEditors['editor-' + sub.id];
                if (q) {
                    const htmlContent = q.root.innerHTML === '<p><br></p>' ? '' : q.root.innerHTML;
                    sub.content = htmlContent;
                }
            });
        }
    });"""

content = content.replace(old_save, new_save)

# 3. Update initWorkspaceEditors
old_init = """    // Initialize for each sub-section
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
    });"""

new_init = """    // Initialize for each chapter and sub-section
    window.currentTechReport.forEach(sec => {
        // Init Chapter Editor
        const secEditorId = 'editor-' + sec.id;
        const secContainer = document.getElementById(secEditorId);
        if (secContainer && !window.chapterEditors[secEditorId]) {
            window.chapterEditors[secEditorId] = new Quill('#' + secEditorId, {
                theme: 'snow',
                modules: { toolbar: toolbarOptions }
            });
            if (sec.content) {
                window.chapterEditors[secEditorId].root.innerHTML = sec.content;
            }
        }
        
        // Init Sub-chapter Editors
        if (sec.subsections) {
            sec.subsections.forEach(sub => {
                const editorId = 'editor-' + sub.id;
                const container = document.getElementById(editorId);
                if (container && !window.chapterEditors[editorId]) {
                    window.chapterEditors[editorId] = new Quill('#' + editorId, {
                        theme: 'snow',
                        modules: { toolbar: toolbarOptions }
                    });
                    if (sub.content) {
                        window.chapterEditors[editorId].root.innerHTML = sub.content;
                    }
                }
            });
        }
    });"""

content = content.replace(old_init, new_init)

with open('static/js/app.js', 'w') as f:
    f.write(content)
