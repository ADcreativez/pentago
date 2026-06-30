import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# We want to inject cards right after `reportsContainer.innerHTML = '';` and before `let imageCounter = 0;`

injected_chapters = """
    // ==== INJECT PREVIEW CHAPTERS (Halaman Sampul, Daftar Isi, Bab 1, Bab 2, Bab 3) ====
    let chaptersHTML = `
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
        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
            <div class="sysreptor-report-title"><span>Bab 1: Ringkasan Eksekutif (Executive Summary)</span></div>
            <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: var(--text-secondary); font-style: italic;">Menampilkan Latar Belakang, Tujuan, Ruang Lingkup, dan Batasan Pekerjaan.</p>
            </div>
        </div>
        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
            <div class="sysreptor-report-title"><span>Bab 2: Metodologi (Methodology)</span></div>
            <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: var(--text-secondary); font-style: italic;">Menampilkan metodologi pengetesan: Planning, Intelligence Gathering, Assessment, Testing, Reporting.</p>
            </div>
        </div>
        <h3 style="font-family: var(--font-title); font-size: 1.2rem; margin-top: 3rem; margin-bottom: 1rem; color: var(--text-primary);">Bab 3: Laporan Teknis (Findings)</h3>
    `;
    reportsContainer.innerHTML = chaptersHTML;
"""

content = content.replace("    reportsContainer.innerHTML = '';\n    \n    let imageCounter = 0;", injected_chapters + "\n    let imageCounter = 0;")

with open('static/js/app.js', 'w') as f:
    f.write(content)

