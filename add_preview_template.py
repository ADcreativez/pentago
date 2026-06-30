import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# 1. Add the Preview button to loadReportTemplates
btn_html = """                            <button class="btn btn-action-view" onclick="previewReportTemplate(${t.id})" title="Preview Template Report" style="color: var(--accent-blue); background: rgba(15, 98, 254, 0.1);">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <button class="btn btn-action-edit" onclick="openReportTemplateModal(${t.id})" """

content = content.replace('<button class="btn btn-action-edit" onclick="openReportTemplateModal(${t.id})"', btn_html)

# 2. Add the previewReportTemplate function
preview_func = """
async function previewReportTemplate(id) {
    try {
        const res = await fetch(`/api/report_templates/${id}`);
        if (!res.ok) {
            alert("Failed to load template data.");
            return;
        }
        const t = await res.json();
        
        let structure = [];
        try {
            structure = JSON.parse(t.structure || '[]');
        } catch(e){}

        // Generate a mock HTML preview
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preview: ${t.name}</title>
            <style>
                body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #f1f5f9; color: #334155; }
                .page { background: white; width: 210mm; min-height: 297mm; margin: 2rem auto; padding: 2cm; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); position: relative; box-sizing: border-box; }
                .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100%; min-height: 240mm; }
                .cover h1 { font-size: 2.5rem; color: #0f172a; margin-bottom: 1rem; }
                .cover h2 { font-size: 1.5rem; color: #475569; font-weight: 400; }
                .classification { font-weight: bold; color: #dc2626; border: 2px solid #dc2626; padding: 0.5rem 1rem; text-transform: uppercase; margin-top: 2rem; display: inline-block; }
                .footer { position: absolute; bottom: 2cm; left: 2cm; right: 2cm; text-align: center; font-size: 0.85rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
                
                .toc-title { font-size: 1.8rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
                .toc-chapter { font-size: 1.1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                .toc-sub { font-size: 0.95rem; margin-left: 1.5rem; color: #475569; margin-bottom: 0.3rem; }
                
                .chapter-title { font-size: 2rem; border-bottom: 2px solid #3b82f6; color: #1e3a8a; padding-bottom: 0.5rem; margin-top: 3rem; margin-bottom: 1.5rem; }
                .sub-title { font-size: 1.3rem; color: #0f172a; margin-top: 2rem; margin-bottom: 1rem; }
                .placeholder-text { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 2rem; text-align: center; color: #94a3b8; font-style: italic; border-radius: 8px; }
            </style>
        </head>
        <body>
            <!-- Cover Page -->
            <div class="page">
                <div class="cover">
                    <h1>[Project Name Placeholder]</h1>
                    <h2>${t.template_type} Report</h2>
                    <div style="margin-top: 4rem;">
                        <p style="font-size: 1.2rem;">Prepared for:</p>
                        <p style="font-size: 1.5rem; font-weight: 600;">[Client Company Name]</p>
                    </div>
                    <div class="classification">${t.classification}</div>
                </div>
                <div class="footer">${t.footer_text || 'PentaGO Security Assessment Report'}</div>
            </div>
            
            <!-- Table of Contents -->
            <div class="page">
                <h2 class="toc-title">Table of Contents</h2>
        `;
        
        // TOC Generation
        structure.forEach((ch, i) => {
            html += `<div class="toc-chapter">${i+1}. ${ch.title}</div>`;
            if (ch.subchapters) {
                ch.subchapters.forEach((sub, j) => {
                    html += `<div class="toc-sub">${i+1}.${j+1}. ${sub.title}</div>`;
                });
            }
        });
        
        html += `<div class="footer">${t.footer_text || 'PentaGO Security Assessment Report'}</div></div>`;
        
        // Content Pages Generation
        structure.forEach((ch, i) => {
            html += `<div class="page">
                <h2 class="chapter-title">${i+1}. ${ch.title}</h2>
                <div class="placeholder-text">Content for ${ch.title} will be written here in the Project Workspace.</div>
            `;
            if (ch.subchapters) {
                ch.subchapters.forEach((sub, j) => {
                    html += `
                        <h3 class="sub-title">${i+1}.${j+1}. ${sub.title}</h3>
                        <div class="placeholder-text">Content for ${sub.title} will be written here in the Project Workspace.</div>
                    `;
                });
            }
            html += `<div class="footer">${t.footer_text || 'PentaGO Security Assessment Report'}</div></div>`;
        });
        
        html += `
        </body>
        </html>`;
        
        const previewWin = window.open('', '_blank');
        previewWin.document.write(html);
        previewWin.document.close();
        
    } catch (e) {
        console.error(e);
        alert("Error generating template preview.");
    }
}
"""

if "async function previewReportTemplate" not in content:
    content += "\n" + preview_func

with open('static/js/app.js', 'w') as f:
    f.write(content)
