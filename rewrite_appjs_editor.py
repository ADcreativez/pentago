import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

old_block = r"    // ==== INJECT PREVIEW CHAPTERS \(Halaman Sampul.*?<h3 style=\"font-family: var\(--font-title\); font-size: 1\.2rem; margin-top: 3rem; margin-bottom: 1rem; color: var\(--text-primary\);\">Bab 3: Laporan Teknis \(Findings\)</h3>\n    `;"

new_block = """    // ==== INJECT PREVIEW CHAPTERS (Halaman Sampul, Daftar Isi, Bab 1, Bab 2, Bab 3) ====
    const defaultStructure = [
        { id: 'sec-1', title: 'Bab 1: Ringkasan Eksekutif (Executive Summary)', subsections: [
            { id: 'sub-1-1', title: '1.1 Latar Belakang' },
            { id: 'sub-1-2', title: '1.2 Tujuan' },
            { id: 'sub-1-3', title: '1.3 Ruang Lingkup' },
            { id: 'sub-1-4', title: '1.4 Batasan Pekerjaan' }
        ]},
        { id: 'sec-2', title: 'Bab 2: Metodologi (Methodology)', subsections: [
            { id: 'sub-2-1', title: '2.1 Fase Metodologi' }
        ]}
    ];

    let techReport = [];
    try {
        if (p.technical_report) techReport = JSON.parse(p.technical_report);
    } catch(e) {}
    if (!techReport || techReport.length === 0) techReport = defaultStructure;

    // Attach to window so save function can access it
    window.currentTechReport = techReport;

    let chaptersHTML = `
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-title); font-size: 1.2rem; color: var(--text-primary);">Editor Laporan (Word Processor)</h3>
            ${canEditProject(p) ? `<button class="btn btn-primary" onclick="saveAllEditors()" style="font-size:0.9rem; padding: 0.5rem 1rem; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(15, 98, 254, 0.3);">💾 Save All Changes</button>` : ''}
        </div>
        
        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
            <div class="sysreptor-report-title"><span>Halaman Sampul (Cover Page)</span></div>
            <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
                <p style="color: var(--text-secondary); font-style: italic;">Cover page generated automatically based on project details and company settings.</p>
            </div>
        </div>
        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
            <div class="sysreptor-report-title"><span>Daftar Isi (Table of Contents)</span></div>
            <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                <ul style="color: var(--text-secondary); margin-left: 1.5rem; font-family: monospace;">
                    <li>1. Ringkasan Eksekutif</li>
                    <li>2. Metodologi</li>
                    <li>3. Laporan Teknis</li>
                </ul>
            </div>
        </div>
    `;

    // Generate Dynamic Cards for each subsection
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
    });

    chaptersHTML += `<h3 style="font-family: var(--font-title); font-size: 1.2rem; margin-top: 3rem; margin-bottom: 1rem; color: var(--text-primary);">Bab 3: Laporan Teknis (Findings)</h3>`;
"""

content = re.sub(old_block, new_block.strip(), content, flags=re.DOTALL)

with open('static/js/app.js', 'w') as f:
    f.write(content)
