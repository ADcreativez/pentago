import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Update saveAllEditors
save_find = """    const payload = {
        technical_report: JSON.stringify(window.currentTechReport)
    };"""

save_replace = """    const payload = {
        technical_report: JSON.stringify(window.currentTechReport)
    };
    
    const coverLogoEl = document.getElementById('cover-logo-input');
    if (coverLogoEl) {
        payload.cover_logo = coverLogoEl.value;
        payload.client_logo = document.getElementById('client-logo-input').value;
        payload.header_text = document.getElementById('header-text-input').value;
        payload.footer_text = document.getElementById('footer-text-input').value;
    }"""

if save_find in content:
    content = content.replace(save_find, save_replace)

# 2. Update viewProject Chapters HTML
html_find = """        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
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
        </div>"""

html_replace = """        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
            <div class="sysreptor-report-title"><span>Halaman Sampul (Cover Page)</span></div>
            <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; text-align: left;">
                ${canEditProject(p) ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Header Text</label>
                        <input type="text" id="header-text-input" class="form-control" value="${p.header_text || ''}" placeholder="e.g. Confidential Report">
                    </div>
                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Footer Text</label>
                        <input type="text" id="footer-text-input" class="form-control" value="${p.footer_text || ''}" placeholder="e.g. Pentago Security">
                    </div>
                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Cover Logo URL</label>
                        <input type="text" id="cover-logo-input" class="form-control" value="${p.cover_logo || ''}" placeholder="https://...">
                    </div>
                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Client Logo URL</label>
                        <input type="text" id="client-logo-input" class="form-control" value="${p.client_logo || ''}" placeholder="https://...">
                    </div>
                </div>
                ` : `
                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                    <p><strong>Header:</strong> ${p.header_text || '-'}</p>
                    <p><strong>Footer:</strong> ${p.footer_text || '-'}</p>
                    <p><strong>Cover Logo:</strong> ${p.cover_logo || '-'}</p>
                    <p><strong>Client Logo:</strong> ${p.client_logo || '-'}</p>
                </div>
                `}
            </div>
        </div>
        <div class="sysreptor-report-card" style="margin-bottom: 2rem;">
            <div class="sysreptor-report-title"><span>Daftar Isi (Table of Contents)</span></div>
            <div class="sysreptor-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                <ul id="toc-container" style="color: var(--text-secondary); margin-left: 1.5rem; font-family: monospace;">
                    <li>1. Ringkasan Eksekutif</li>
                    <li>2. Metodologi</li>
                    <li>3. Laporan Teknis (Findings)</li>
                </ul>
            </div>
        </div>"""

if html_find in content:
    content = content.replace(html_find, html_replace)

with open('static/js/app.js', 'w') as f:
    f.write(content)

