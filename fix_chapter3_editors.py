import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Revert my hardcoded Bab 3 HTML to just chaptersHTML += `<div id="workspace-chapters-container"></div>`;
hardcoded_html = """    chaptersHTML += `
    <div class="sysreptor-report-card" style="margin-top: 2rem; margin-bottom: 2rem; border-color: #3b82f6;">
        <div class="sysreptor-report-title" style="background: #eff6ff; color: #1e3a8a; display: flex; align-items: center;">
            <span style="font-size: 1.1rem; font-weight:bold;">Bab 3: Laporan Teknis (Findings)</span>
        </div>
        <div style="padding: 1rem; background: #f8fafc; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
            <div style="margin-bottom: 1.5rem; border: 1px solid #e2e8f0; border-radius: 6px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.5rem 1rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; border-radius: 6px 6px 0 0;">
                    <div style="flex:1; display:flex; gap:0.5rem; align-items:center;">
                        <span style="color:#64748b;">↳</span>
                        <span style="font-size: 0.95rem; font-weight:600; color: #334155;">3.1 Intelligence Gathering</span>
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 1.5rem; border: 1px solid #e2e8f0; border-radius: 6px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.5rem 1rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; border-radius: 6px 6px 0 0;">
                    <div style="flex:1; display:flex; gap:0.5rem; align-items:center;">
                        <span style="color:#64748b;">↳</span>
                        <span style="font-size: 0.95rem; font-weight:600; color: #334155;">3.2 Vulnerability Assessment</span>
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 0; border: 1px solid #e2e8f0; border-radius: 6px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.5rem 1rem; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; border-radius: 6px 6px 0 0;">
                    <div style="flex:1; display:flex; gap:0.5rem; align-items:center;">
                        <span style="color:#64748b;">↳</span>
                        <span style="font-size: 0.95rem; font-weight:600; color: #334155;">3.3 Penetration Testing (Exploitation) <span style="margin-left:0.5rem; color:#64748b;">↳</span> 3.3.1.1 Rincian Temuan</span>
                    </div>
                </div>
                <div style="padding: 1rem;" id="findings-table-container">
                </div>
            </div>
        </div>
    </div>`;"""

if hardcoded_html in content:
    content = content.replace(hardcoded_html, "")
else:
    print("Could not find hardcoded HTML")

# 2. Inject Bab 3 into defaultStructure logic
inject_logic = """    let techReport = [];
    try {
        if (p.technical_report) techReport = JSON.parse(p.technical_report);
    } catch(e) {}
    if (!Array.isArray(techReport) || techReport.length === 0) techReport = defaultStructure;

    // Ensure Bab 3 is present
    const hasBab3 = techReport.some(sec => sec.title.includes('Bab 3'));
    if (!hasBab3) {
        techReport.push({
            id: 'sec-3',
            title: 'Bab 3: Laporan Teknis (Findings)',
            subsections: [
                { id: 'sub-3-1', title: '3.1 Intelligence Gathering' },
                { id: 'sub-3-2', title: '3.2 Vulnerability Assessment' },
                { id: 'sub-3-3', title: '3.3 Penetration Testing (Exploitation)' }
            ]
        });
    }"""
content = re.sub(r'let techReport = \[\];\s*try {\s*if \(p\.technical_report\) techReport = JSON\.parse\(p\.technical_report\);\s*} catch\(e\) \{\}\s*if \(\!Array\.isArray\(techReport\) \|\| techReport\.length === 0\) techReport = defaultStructure;', inject_logic, content)

# 3. Add findings-table-container inside sub-3-3 in renderWorkspaceChapters
subchapter_html_old = """                    <div style="padding: 0.5rem;">
                        ${canEditProject(currentProject) ? `<div id="editor-${sub.id}" class="wp-editor" style="height: 200px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sub.content || '', {val:0})}</div>`}
                    </div>
                </div>
                `;"""
subchapter_html_new = """                    <div style="padding: 0.5rem;">
                        ${canEditProject(currentProject) ? `<div id="editor-${sub.id}" class="wp-editor" style="height: 200px; background: white;"></div>` : `<div style="padding: 1rem; background: white; border: 1px solid #ddd;">${renderMarkdownToHtml(sub.content || '', {val:0})}</div>`}
                    </div>
                    ${sub.id === 'sub-3-3' || sub.title.includes('3.3 Penetration') ? `
                        <div style="margin: 1rem 0.5rem; border-top: 1px dashed #cbd5e1; padding-top: 1rem;">
                            <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom: 1rem; padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <span style="color:#64748b;">↳</span>
                                <span style="font-size: 0.95rem; font-weight:600; color: #334155;">3.3.1.1 Rincian Temuan (Findings)</span>
                            </div>
                            <div id="findings-table-container"></div>
                        </div>
                    ` : ''}
                </div>
                `;"""

if subchapter_html_old in content:
    content = content.replace(subchapter_html_old, subchapter_html_new)
else:
    print("Could not find subchapter_html_old")

with open('static/js/app.js', 'w') as f:
    f.write(content)

