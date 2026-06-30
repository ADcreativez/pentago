import re

with open('static/js/preview_builder.js', 'r') as f:
    content = f.read()

old_logic = r"// --- BAB 1 ---.*?// --- BAB 3 \(HASIL PENILAIAN\) ---"

new_logic = """
    let dynamicChaptersHtml = '';
    let techReport = [];
    try {
        if (p.technical_report) techReport = JSON.parse(p.technical_report);
    } catch(e) {}
    
    if (techReport && techReport.length > 0) {
        techReport.forEach(sec => {
            // Append Chapter Title
            dynamicChaptersHtml += `<h2 class="sh-blue">${sec.title}</h2>`;
            if (sec.subsections) {
                sec.subsections.forEach(sub => {
                    dynamicChaptersHtml += `<h3 class="ssh">${sub.title}</h3>`;
                    dynamicChaptersHtml += `<div class="tb">${renderContent(sub.content || '<p>-</p>')}</div>`;
                });
            }
            dynamicChaptersHtml += `<div class="page-break"></div>`;
        });
    } else {
        // Fallback to legacy
        dynamicChaptersHtml += `
        <h2 class="sh-blue">${tr("1. RINGKASAN EKSEKUTIF")}</h2>
        <h3 class="ssh">${tr("1.1. Latar Belakang")}</h3>
        <div class="tb">${renderContent(p.description)}</div>
        <h3 class="ssh">${tr("1.2. Tujuan")}</h3>
        <div class="tb">${renderContent(bgText || '-')}</div>
        <h3 class="ssh">${tr("1.3. Ruang Lingkup")}</h3>
        <div class="tb">${renderContent(p.scope || '-')}</div>
        <h3 class="ssh">${tr("1.4. Batasan Pekerjaan")}</h3>
        <div class="tb">${renderContent(p.out_of_scope || '-')}</div>
        <div class="page-break"></div>
        <h2 class="sh-blue">${tr("2. METODOLOGI")}</h2>
        <div class="tb">${p.methodology_text && p.methodology_text.trim() ? renderContent(p.methodology_text) : renderContent(methText || '-')}</div>
        <div class="page-break"></div>`;
    }

    // --- BAB 3 (HASIL PENILAIAN) ---
"""

content = re.sub(old_logic, new_logic.strip() + "\n    // --- BAB 3 (HASIL PENILAIAN) ---", content, flags=re.DOTALL)

with open('static/js/preview_builder.js', 'w') as f:
    f.write(content)
