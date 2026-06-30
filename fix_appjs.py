with open('static/js/app.js', 'a') as f:
    f.write("""

// openReportPreview - renders and opens preview window
async function openReportPreview(lang = 'id') {
    if (!currentProjectId) {
        alert("Pilih proyek terlebih dahulu!");
        return;
    }
    try {
        const resProj = await fetch(`/api/projects/${currentProjectId}`);
        const p = await resProj.json();
        
        const resFindings = await fetch(`/api/findings?project_id=${currentProjectId}`);
        const findings = await resFindings.json();
        findings.sort((a, b) => b.cvss_score - a.cvss_score);

        let spacingMode = 1.4;
        const spacingSelector = document.getElementById('report-spacing-selector');
        if (spacingSelector) {
            spacingMode = parseFloat(spacingSelector.value) || 1.4;
        }

        const previewHtml = _buildPreviewDocument(p, findings, null, [], lang, false, spacingMode);
        const w = window.open();
        w.document.write(previewHtml);
        w.document.close();
    } catch(err) {
        console.error('Error inside openReportPreview:', err);
        alert("Gagal membangun dokumen pratinjau: " + err.message);
    }
}
""")
