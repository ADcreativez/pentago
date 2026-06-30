import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Replace the inner loop inside viewProject with a container and a call to renderWorkspaceChapters()
old_viewProject_loop = """    // Generate Dynamic Cards for each Chapter and Sub-chapter
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
    });

    chaptersHTML += `<h3 style="font-family: var(--font-title); font-size: 1.2rem; margin-top: 3rem; margin-bottom: 1rem; color: var(--text-primary);">Bab 3: Laporan Teknis (Findings)</h3>`;
    reportsContainer.innerHTML = chaptersHTML;"""

new_viewProject_loop = """    chaptersHTML += `<div id="workspace-chapters-container"></div>`;
    chaptersHTML += `<h3 style="font-family: var(--font-title); font-size: 1.2rem; margin-top: 3rem; margin-bottom: 1rem; color: var(--text-primary);">Bab 3: Laporan Teknis (Findings)</h3>`;
    reportsContainer.innerHTML = chaptersHTML;
    
    if (window.renderWorkspaceChapters) {
        window.renderWorkspaceChapters();
    }"""

content = content.replace(old_viewProject_loop, new_viewProject_loop)

# 2. Add renderWorkspaceChapters and the CRUD functions
crud_functions = """
window.renderWorkspaceChapters = function() {
    const container = document.getElementById('workspace-chapters-container');
    if (!container) return;
    
    // Save current quill contents first before re-rendering
    if (window.chapterEditors) {
        window.currentTechReport.forEach(sec => {
            const qSec = window.chapterEditors['editor-' + sec.id];
            if (qSec) sec.content = qSec.root.innerHTML === '<p><br></p>' ? '' : qSec.root.innerHTML;
            if (sec.subsections) {
                sec.subsections.forEach(sub => {
                    const qSub = window.chapterEditors['editor-' + sub.id];
                    if (qSub) sub.content = qSub.root.innerHTML === '<p><br></p>' ? '' : qSub.root.innerHTML;
                });
            }
        });
    }

    let html = '';
    window.currentTechReport.forEach((sec, sIdx) => {
        html += `
        <div class="sysreptor-report-card" style="margin-bottom: 2rem; border-color: #3b82f6;">
            <div class="sysreptor-report-title" style="display:flex; justify-content:space-between; align-items:center; background: #eff6ff; color: #1e3a8a;">
                <div style="flex:1; display:flex; gap:0.5rem; align-items:center;">
                    <input type="text" class="form-control" value="${sec.title}" onchange="wsUpdateChapterTitle(${sIdx}, this.value)" style="font-size: 1.1rem; font-weight:bold; color: #1e3a8a; border:1px solid transparent; background:transparent; padding:0.2rem 0.5rem; flex:1;">
                </div>
                ${canEditProject(currentProject) ? `<button class="btn-helper" style="color:#ef4444; border-color:#ef4444; padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="wsDeleteChapter(${sIdx})">Delete Chapter</button>` : ''}
            </div>
            <div class="card-edit-content" style="padding: 1rem; background: #fafafa; border: 1px solid var(--border-color); border-top: none; border-bottom: none;">
                ${canEditProject(currentProject) ? `<div id="editor-${sec.id}" class="wp-editor" style="height: 250px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sec.content || '', {val:0})}</div>`}
            </div>
            
            <!-- Subchapters Container Inside Chapter Card -->
            <div style="padding: 1rem; background: #f8fafc; border: 1px solid var(--border-color); border-top: 1px dashed #cbd5e1; border-radius: 0 0 8px 8px;">
                <h4 style="font-size:0.9rem; color:var(--text-secondary); margin-top:0; margin-bottom:1rem;">Sub-chapters</h4>
        `;
        
        if (sec.subsections) {
            sec.subsections.forEach((sub, subIdx) => {
                html += `
                <div style="margin-bottom: 1.5rem; border: 1px solid #e2e8f0; border-radius: 6px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.5rem 1rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; border-radius: 6px 6px 0 0;">
                        <div style="flex:1; display:flex; gap:0.5rem; align-items:center;">
                            <span style="color:#64748b;">↳</span>
                            <input type="text" class="form-control" value="${sub.title}" onchange="wsUpdateSubchapterTitle(${sIdx}, ${subIdx}, this.value)" style="font-size: 0.95rem; font-weight:600; color: #334155; border:1px solid transparent; background:transparent; padding:0.2rem 0.5rem; flex:1;">
                        </div>
                        ${canEditProject(currentProject) ? `<button class="btn-helper" style="color:#ef4444; border-color:#ef4444; padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="wsDeleteSubchapter(${sIdx}, ${subIdx})">Delete Sub</button>` : ''}
                    </div>
                    <div style="padding: 0.5rem;">
                        ${canEditProject(currentProject) ? `<div id="editor-${sub.id}" class="wp-editor" style="height: 200px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sub.content || '', {val:0})}</div>`}
                    </div>
                </div>
                `;
            });
        }
        
        if (canEditProject(currentProject)) {
            html += `<button class="btn-helper" onclick="wsAddSubchapter(${sIdx})" style="font-size:0.8rem; padding: 0.3rem 0.6rem;">+ Add Sub-chapter</button>`;
        }
        
        html += `
            </div>
        </div>
        `;
    });
    
    if (canEditProject(currentProject)) {
        html += `<div style="text-align:center; margin-top:1rem; margin-bottom:2rem;"><button class="btn btn-secondary" onclick="wsAddChapter()">+ Add New Chapter</button></div>`;
    }
    
    container.innerHTML = html;
    
    window.chapterEditors = {};
    window.initWorkspaceEditors();
};

window.wsAddChapter = function() {
    window.currentTechReport.push({ id: 'sec-' + Date.now(), title: 'New Chapter', subsections: [] });
    window.renderWorkspaceChapters();
};

window.wsDeleteChapter = function(sIdx) {
    if (confirm('Delete this entire chapter and its sub-chapters?')) {
        window.currentTechReport.splice(sIdx, 1);
        window.renderWorkspaceChapters();
    }
};

window.wsAddSubchapter = function(sIdx) {
    if (!window.currentTechReport[sIdx].subsections) window.currentTechReport[sIdx].subsections = [];
    window.currentTechReport[sIdx].subsections.push({ id: 'sub-' + Date.now(), title: 'New Sub-chapter' });
    window.renderWorkspaceChapters();
};

window.wsDeleteSubchapter = function(sIdx, subIdx) {
    if (confirm('Delete this sub-chapter?')) {
        window.currentTechReport[sIdx].subsections.splice(subIdx, 1);
        window.renderWorkspaceChapters();
    }
};

window.wsUpdateChapterTitle = function(sIdx, val) {
    window.currentTechReport[sIdx].title = val;
};

window.wsUpdateSubchapterTitle = function(sIdx, subIdx, val) {
    window.currentTechReport[sIdx].subsections[subIdx].title = val;
};
"""

if "window.renderWorkspaceChapters =" not in content:
    content += "\n" + crud_functions

with open('static/js/app.js', 'w') as f:
    f.write(content)

