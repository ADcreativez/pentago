import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

find_logic = """    // Ensure Bab 3 is present
    const hasBab3 = techReport.some(sec => sec.title.includes('Bab 3'));"""

inject_logic = """    // Ensure Bab 2 has default content if empty
    const sec2 = techReport.find(s => s.id === 'sec-2' || s.title.includes('Bab 2'));
    if (sec2) {
        if (!sec2.content) {
            sec2.content = `<p>PT Inovasi Informatika Indonesia menggunakan framework yang disesuaikan dengan target seperti Open Web Application Security Project (OWASP), Penetration Testing Execution Standard (PTES), dll.</p><p><br></p><p>Pengujian ini mengikuti standar industri seperti OWASP (Open Web Application Security Project) dan PTES (Penetration Testing Execution Standard) dengan tahapan pengumpulan informasi, pemetaan kerentanan, eksploitasi, hingga analisis dampak.</p><p><br></p><table style="width:100%; border:none; border-collapse:collapse; margin:15px 0;"><tr><td align="center" style="background:#22c55e; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; font-size:10px; text-align:center; width:16%;">Planning</td><td align="center" style="font-size:12px; color:#64748b; width:4%;">&#9654;</td><td align="center" style="background:#eab308; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; font-size:10px; text-align:center; width:16%;">Intelligence Gathering</td><td align="center" style="font-size:12px; color:#64748b; width:4%;">&#9654;</td><td align="center" style="background:#3b82f6; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; font-size:10px; text-align:center; width:16%;">Assessment</td><td align="center" style="font-size:12px; color:#64748b; width:4%;">&#9654;</td><td align="center" style="background:#ef4444; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; font-size:10px; text-align:center; width:16%;">Testing</td><td align="center" style="font-size:12px; color:#64748b; width:4%;">&#9654;</td><td align="center" style="background:#8b5cf6; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; font-size:10px; text-align:center; width:16%;">Reporting</td></tr></table><p><br></p><p><strong>Planning</strong> — Perjanjian antar pihak dan aturan keterlibatan. <strong>Information Gathering</strong> — Mengumpulkan informasi secara aktif dan pasif. <strong>Assessment</strong> — Mencari celah (Vulnerability Assessment) dan mensimulasikan serangan. <strong>Testing</strong> — Melakukan testing (Penetration Testing) berdasarkan OWASP Top 10. <strong>Report</strong> — Menganalisis data dan menuliskan laporan.</p>`;
        }
        
        let sub21 = null;
        if (!sec2.subsections) sec2.subsections = [];
        sub21 = sec2.subsections.find(s => s.id === 'sub-2-1' || s.title.includes('Risk Assessment') || s.title.includes('Fase'));
        if (!sub21) {
            sub21 = { id: 'sub-2-1', title: '2.1. Risk Assessment' };
            sec2.subsections.push(sub21);
        } else {
            sub21.title = '2.1. Risk Assessment';
        }
        
        if (!sub21.content) {
            sub21.content = `<table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; margin-top:1rem;"><thead style="background:#1e3a8a; color:white;"><tr><th style="padding:10px; border:1px solid #e2e8f0; text-align:left;">CVSS Score</th><th style="padding:10px; border:1px solid #e2e8f0; text-align:left;">Severity</th><th style="padding:10px; border:1px solid #e2e8f0; text-align:left;">Definition</th></tr></thead><tbody><tr><td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">0.0</td><td style="padding:10px; border:1px solid #e2e8f0;"><span style="background:#f8fafc; color:#64748b; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">NONE</span></td><td style="padding:10px; border:1px solid #e2e8f0;">Tidak ada kerentanan yang ada.</td></tr><tr><td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">0.1 - 3.9</td><td style="padding:10px; border:1px solid #e2e8f0;"><span style="background:#dcfce7; color:#16a34a; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">LOW</span></td><td style="padding:10px; border:1px solid #e2e8f0;">Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan.</td></tr><tr><td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">4.0 - 6.9</td><td style="padding:10px; border:1px solid #e2e8f0;"><span style="background:#fef9c3; color:#ca8a04; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">MEDIUM</span></td><td style="padding:10px; border:1px solid #e2e8f0;">Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah tambahan.</td></tr><tr><td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">7.0 - 8.9</td><td style="padding:10px; border:1px solid #e2e8f0;"><span style="background:#fee2e2; color:#dc2626; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">HIGH</span></td><td style="padding:10px; border:1px solid #e2e8f0;">Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan kehilangan data.</td></tr><tr><td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">9.0 - 10.0</td><td style="padding:10px; border:1px solid #e2e8f0;"><span style="background:#f3e8ff; color:#9333ea; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">CRITICAL</span></td><td style="padding:10px; border:1px solid #e2e8f0;">Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.</td></tr></tbody></table>`;
        }
    }

    // Ensure Bab 3 is present
    const hasBab3 = techReport.some(sec => sec.title.includes('Bab 3'));"""

if find_logic in content:
    content = content.replace(find_logic, inject_logic)
else:
    print("Could not find insertion point!")

with open('static/js/app.js', 'w') as f:
    f.write(content)
