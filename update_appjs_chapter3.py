import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

find1 = """    chaptersHTML += `<div id="workspace-chapters-container"></div>`;
    chaptersHTML += `<h3 style="font-family: var(--font-title); font-size: 1.2rem; margin-top: 3rem; margin-bottom: 1rem; color: var(--text-primary);">Bab 3: Laporan Teknis (Findings)</h3>`;"""

replace1 = """    chaptersHTML += `<div id="workspace-chapters-container"></div>`;
    chaptersHTML += `
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

if find1 in content:
    content = content.replace(find1, replace1)

find2 = """    if (findings.length === 0) {
        reportsContainer.innerHTML += '<div style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">No findings added yet. Add a finding to preview report workspace.</div>';
    } else {"""

replace2 = """    if (findings.length === 0) {
        const fc = document.getElementById('findings-table-container');
        if (fc) fc.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">No findings added yet. Add a finding to preview report workspace.</div>';
    } else {"""

if find2 in content:
    content = content.replace(find2, replace2)

find3 = """        });
        reportsContainer.innerHTML += reportsHTML;
    }"""

replace3 = """        });
        const fc = document.getElementById('findings-table-container');
        if (fc) fc.innerHTML = reportsHTML;
        else reportsContainer.innerHTML += reportsHTML;
    }"""

if find3 in content:
    content = content.replace(find3, replace3)

with open('static/js/app.js', 'w') as f:
    f.write(content)

