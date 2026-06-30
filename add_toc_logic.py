import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

find_toc = """                <ul id="toc-container" style="color: var(--text-secondary); margin-left: 1.5rem; font-family: monospace;">
                    <li>1. Ringkasan Eksekutif</li>
                    <li>2. Metodologi</li>
                    <li>3. Laporan Teknis (Findings)</li>
                </ul>"""

replace_toc = """                <ul id="toc-container" style="color: var(--text-primary); margin-left: 1.5rem; font-family: monospace; line-height: 1.6;">
                    ${(function() {
                        let html = '';
                        if (window.currentTechReport) {
                            window.currentTechReport.forEach((sec, idx) => {
                                html += `<li><strong>${idx + 1}. ${sec.title.replace(/Bab \\d+: /, '')}</strong></li>`;
                                if (sec.subsections && sec.subsections.length > 0) {
                                    html += `<ul style="margin-left: 1.5rem;">`;
                                    sec.subsections.forEach((sub, subIdx) => {
                                        html += `<li>${idx + 1}.${subIdx + 1} ${sub.title.replace(/\\d+\\.\\d+ /, '')}</li>`;
                                    });
                                    html += `</ul>`;
                                }
                            });
                        }
                        if (findings.length > 0) {
                            html += `<ul style="margin-left: 1.5rem; margin-top: 0.5rem;">`;
                            findings.forEach((f, fIdx) => {
                                html += `<li>- ${f.title}</li>`;
                            });
                            html += `</ul>`;
                        }
                        return html;
                    })()}
                </ul>"""

if find_toc in content:
    content = content.replace(find_toc, replace_toc)
else:
    print("Could not find TOC section")

with open('static/js/app.js', 'w') as f:
    f.write(content)

