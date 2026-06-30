// ==========================================
// _buildPreviewDocument  —  A4 Report Preview Builder
// Format mirip i3/PLN EPI: VAPT Report Template
// ==========================================

function _buildPreviewDocument(p, findings, tpl, structure, lang = 'id', isDocx = false, spacingMult = 1.4) {
    const classification = tpl ? (tpl.classification || 'CONFIDENTIAL') : 'CONFIDENTIAL';
    const footerText     = p.footer_text || (tpl ? (tpl.footer_text || 'Document Control') : 'Document Control');
    const reportTitle    = p.header_text || (tpl ? (tpl.default_title || 'VULNERABILITY ASSESSMENT REPORT & PENETRATION TESTING') : 'VULNERABILITY ASSESSMENT REPORT & PENETRATION TESTING');
    const companyName    = p.company_name || p.name || '-';
    const todayStr = lang === 'en'
        ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr  = new Date().getFullYear();

    // Translation helper dict
    const tr = (text) => {
        if (!text) return '';
        if (lang !== 'en') return text;
        const dict = {
            "DAFTAR ISI": "TABLE OF CONTENTS",
            "PRATINJAU": "PREVIEW",
            "1. RINGKASAN EKSEKUTIF": "1. EXECUTIVE SUMMARY",
            "1.1. Latar Belakang": "1.1. Background",
            "1.2. Ruang Lingkup": "1.2. Scope of Work",
            "1.3. Skenario Penetration Testing": "1.3. Penetration Testing Scenario",
            "1.4. Batasan Pekerjaan": "1.4. Limitations of Work",
            "1.5. Timeline Kegiatan": "1.5. Timeline of Activities",
            "1.6. OWASP TOP 10 Checklist": "1.6. OWASP TOP 10 Checklist",
            "1.7. Ringkasan Temuan Celah Keamanan": "1.7. Summary of Vulnerability Findings",
            "Pembuatan Laporan": "Report Creation",
            "2. METODOLOGI": "2. METHODOLOGY",
            "2.1. Risk Assessment": "2.1. Risk Assessment",
            "2.2. Penetration Testing Tools": "2.2. Penetration Testing Tools",
            "3. LAPORAN TEKNIS": "3. TECHNICAL REPORT",
            "3.1. Intelligence Gathering": "3.1. Intelligence Gathering",
            "3.2. Vulnerability Assessment": "3.2. Vulnerability Assessment",
            "3.3. Penetration Testing (Exploitation)": "3.3. Penetration Testing (Exploitation)",
            "3.3.1 Rincian Temuan": "3.3.1 Finding Details",
            "3.3.1.1 Rincian Temuan": "3.3.1.1 Finding Details",
            "Tidak ada temuan kerentanan.": "No vulnerability findings.",
            "Tidak ada temuan.": "No findings.",
            "Overall Risk": "Overall Risk",
            "No.": "No.",
            "Temuan": "Finding",
            "Nilai CVSS": "CVSS Score",
            "Klasifikasi Risiko": "Risk Classification",
            "Status": "Status",
            "Judul Temuan": "Finding Title",
            "Sistem Terdampak": "Affected System",
            "CVSS": "CVSS",
            "Severity": "Severity",
            "Surat Perintah Kerja (SPK)": "Work Order (SPK)",
            "Author": "Author",
            "Date": "Date",
            "Version": "Version",
            "Change Reference": "Change Reference",
            "Name": "Name",
            "Company": "Company",
            "Approved": "Approved",
            "Revision History": "Revision History",
            "Approvals": "Approvals",
            "Planning": "Planning",
            "Intelligence Gathering": "Intelligence Gathering",
            "Assessment": "Assessment",
            "Testing": "Testing",
            "Reporting": "Reporting",
            "Perencanaan": "Planning",
            "Pengumpulan Informasi": "Intelligence Gathering",
            "Penilaian": "Assessment",
            "Pengujian": "Testing",
            "Pelaporan": "Reporting",
            "Terbuka": "Open",
            "Selesai": "Fixed",
            "Ditutup": "Closed",
            "Hasil Lulus": "Result Pass",
            "Definition": "Definition",
            "Tidak ada kerentanan yang ada.": "No vulnerabilities exist.",
            "Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan.": "Vulnerabilities cannot be exploited but will reduce the attack surface.",
            "Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah tambahan.": "Vulnerabilities exist but cannot be exploited or require additional steps.",
            "Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan kehilangan data.": "Exploitation is difficult but can lead to privilege escalation and data loss.",
            "Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.": "Exploitation is very easy and typically results in system-level compromise."
        };
        const clean = text.trim();
        return dict[clean] || text;
    };

    // Severity config
    const sevColor = { Critical:'#7c3aed', High:'#dc2626', Medium:'#d97706', Low:'#16a34a', Info:'#0284c7' };
    const sevBg    = { Critical:'#f5f3ff', High:'#fef2f2', Medium:'#fffbeb', Low:'#f0fdf4', Info:'#eff6ff' };
    const riskColor = { Critical:'#7c3aed', High:'#dc2626', Medium:'#d97706', Low:'#16a34a', None:'#64748b', Info:'#0284c7' };

    // Render content (Quill HTML or markdown)
    const renderContent = (txt) => {
        if (!txt || !txt.trim()) return '<p style="color:#94a3b8;font-style:italic;">-</p>';
        const t = txt.trim();
        const isHtml = (t.startsWith('<p') || t.startsWith('<h') || t.startsWith('<ul') || t.startsWith('<ol') ||
                        t.startsWith('<div') || t.startsWith('<strong') || t.startsWith('<em') ||
                        t.startsWith('<blockquote') || t.startsWith('<pre')) && t.includes('</');
        if (isHtml) {
            try { return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(t) : t; } catch(e) { return t; }
        }
        return _simMd(t);
    };

    const estimateHtmlHeight = (html) => {
        if (!html) return 0;
        const cleanText = html.replace(/<[^>]*>/g, '').trim();
        let h = Math.max(30, Math.ceil(cleanText.length / 75) * 22 * spacingMult);

        const h2Count = (html.match(/<h2/g) || []).length;
        const h3Count = (html.match(/<h3/g) || []).length;
        h += (h2Count * 50 + h3Count * 40) * spacingMult;

        const trCount = (html.match(/<tr/g) || []).length;
        h += trCount * 35 * spacingMult;

        const imgCount = (html.match(/<img/g) || []).length;
        h += imgCount * 300;

        const liCount = (html.match(/<li/g) || []).length;
        h += liCount * 25;

        if (html.includes('methodology-flow')) {
            h += 80;
        }
        
        if (html.includes('Distribusi Tingkat Kerentanan')) {
            h += 180;
        }
        return h;
    };

    // Simple markdown → HTML
    const _simMd = (md) => {
        if (!md) return '';
        let h = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        
        // Headers
        h = h.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>');
        
        // Bold, italic, code
        h = h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
        h = h.replace(/`(.+?)`/g,'<code>$1</code>');
        
        // Format lines with list item markers
        h = h.replace(/^[-*] (.+)$/gm,'<li>$1</li>');
        
        // Group contiguous <li> items into <ul> blocks
        h = h.replace(/(?:^|\n)(<li>[\s\S]+?<\/li>)(?=\n|$)/g, (match, p1) => {
            return `\n<ul>${p1}</ul>`;
        });
        // Collapse adjacent <ul> lists
        h = h.replace(/<\/ul>\s*<ul>/g, '');

        // Wrap non-block lines in paragraphs or handle double newlines
        let paragraphs = h.split(/\n\n+/);
        paragraphs = paragraphs.map(p => {
            p = p.trim();
            if (!p) return '';
            // If it already starts with a block tag, don't wrap it in <p>
            if (p.startsWith('<h3>') || p.startsWith('<h2>') || p.startsWith('<h1>') || p.startsWith('<ul>') || p.startsWith('<li>')) {
                return p.replace(/\n/g, '<br>');
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        });
        
        return paragraphs.join('\n');
    };

    // Stats
    const stats = { Critical:0, High:0, Medium:0, Low:0, Info:0 };
    (findings || []).forEach(f => { const s = f.severity||'Info'; if (stats.hasOwnProperty(s)) stats[s]++; });
    const totalFindings = findings ? findings.length : 0;

    // Overall risk
    const overallRisk = stats.Critical > 0 ? 'CRITICAL' : stats.High > 0 ? 'HIGH' : stats.Medium > 0 ? 'MEDIUM' : stats.Low > 0 ? 'LOW' : 'NONE';
    const overallColor = riskColor[overallRisk === 'NONE' ? 'None' : overallRisk] || '#64748b';

    const totalPages = _estimateTotalPages(structure, findings);
    let pageNum = tpl ? ((tpl.start_page_num !== undefined && tpl.start_page_num !== null) ? parseInt(tpl.start_page_num) : 2) - 2 : 0;
    
    const clientLogoSrc = p.client_logo || (tpl ? tpl.client_logo : null);
    const auditorLogoSrc = p.cover_logo || p.auditor_logo || (tpl ? tpl.auditor_logo : null);
    const useWatermark = p.use_watermark;
    const watermarkCss = useWatermark && auditorLogoSrc ? `style="--watermark-img: url('${auditorLogoSrc}');"` : '';
    const pageClass = useWatermark && auditorLogoSrc ? 'page page-watermark' : 'page';

    // ── Standard header for all pages (except cover) ──────────────
    const mkHeader = (pageTitle) => {
        const hasClientLogo = clientLogoSrc && tpl && tpl.show_client_logo !== 0;
        const hasAuditorLogo = auditorLogoSrc && tpl && tpl.show_auditor_logo !== 0;
        const align = tpl ? tpl.header_alignment : 'center';

        if (align === 'left') {
            const clientLogoImg = hasClientLogo ? `<img src="${clientLogoSrc}" style="height:31px;max-width:91px;object-fit:contain;margin-right:12px;mix-blend-mode:multiply;">` : '';
            return `
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e3a5f;padding:6px 18mm;min-height:16mm;background:#fff;margin-top:30px;">
            <div class="header-main">
                <div class="header-title">${reportTitle}</div>
                <div class="header-subtitle">${companyName}</div>
            </div>
            <div class="header-right" style="display:flex;align-items:center;">
                ${clientLogoImg}
                <div class="header-page">
                    <span class="hdr-label">${footerText}</span>
                    <span class="hdr-sep">|</span>
                    <span class="hdr-pg">Page <strong>${pageNum}</strong></span>
                </div>
            </div>
        </div>`;
        }

        // Center Box (i3 Standard Layout)
        return `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;padding:10px 18mm;width:100%;border-bottom:none;height:auto;background:#fff;margin-top:30px;">
        <!-- Left: Client Logo -->
        <div style="width:25%;display:flex;align-items:center;justify-content:flex-start;">
            ${hasClientLogo ? `<img src="${clientLogoSrc}" style="max-height:62px;max-width:100%;object-fit:contain;mix-blend-mode:multiply;">` : ''}
        </div>
        
        <!-- Center: Bordered Header Box -->
        <div style="width:50%;display:flex;flex-direction:column;align-items:center;">
            <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-family:'Arimo',Arial,sans-serif;font-size:7.5pt;text-align:center;line-height:1.3;">
                <tr>
                    <td style="border:1px solid #000;padding:6px;font-weight:bold;text-transform:uppercase;color:#333;">
                        ${reportTitle}<br>
                        ${companyName}<br>
                        ${p.name}
                    </td>
                </tr>
                <tr>
                    <td style="border:1px solid #000;padding:3px 8px;text-align:right;font-size:7pt;color:#666;font-weight:bold;">
                        Page ${pageNum}
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Right: Auditor Logo -->
        <div style="width:25%;display:flex;align-items:center;justify-content:flex-end;">
            ${hasAuditorLogo ? `<img src="${tpl.auditor_logo}" style="max-height:62px;max-width:100%;object-fit:contain;">` : ''}
        </div>
    </div>`;
    };

    const mkFooter = () => `
    <div class="page-footer" style="display:flex;justify-content:center;align-items:center;min-height:12mm;flex-shrink:0;background:#f8fafc;border-top:none;margin-top:auto;margin-bottom:30px;">
        <span class="cls-tag" style="border-color:#dc2626;color:#dc2626;font-size:11.25pt;font-weight:900;letter-spacing:.1em;text-transform:uppercase;border:1.5px solid;padding:3px 15px;border-radius:2px;display:inline-block;">${classification}</span>
    </div>`;

    const mkPage = (id, content, noHeader = false) => {
        pageNum++;
        if (isDocx) {
            const hasClientLogo = clientLogoSrc && tpl && tpl.show_client_logo !== 0;
            const clientLogoHtml = hasClientLogo ? `<img src="${clientLogoSrc}" height="35" style="height:35px; width:auto;mix-blend-mode:multiply;">` : '';
            const hasAuditorLogo = auditorLogoSrc && tpl && tpl.show_auditor_logo !== 0;
            const auditorLogoHtml = hasAuditorLogo ? `<img src="${auditorLogoSrc}" height="35" style="height:35px; width:auto;">` : '';
            
            const centerTableHtml = `
                <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-family:'Arimo',Arial,sans-serif;font-size:7.5pt;text-align:center;line-height:1.3;">
                    <tr>
                        <td style="border:1px solid #000;padding:6px;font-weight:bold;text-transform:uppercase;color:#333;">
                            ${reportTitle}<br>
                            ${companyName}<br>
                            ${p.name}
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000;padding:3px 8px;text-align:right;font-size:7pt;color:#666;font-weight:bold;">
                            Page ${pageNum}
                        </td>
                    </tr>
                </table>
            `;

            const headerHtml = noHeader ? '' : `
                <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:10px;">
                    <tr>
                        <td style="width:25%; vertical-align:middle; text-align:left;">
                            ${clientLogoHtml}
                        </td>
                        <td style="width:50%; vertical-align:middle; text-align:center;">
                            ${centerTableHtml}
                        </td>
                        <td style="width:25%; vertical-align:middle; text-align:right;">
                            ${auditorLogoHtml}
                        </td>
                    </tr>
                </table>
            `;

            const footerHtml = `
                <table style="width:100%; border:none; border-collapse:collapse; margin-top:15px;">
                    <tr>
                        <td align="center">
                            <span style="border: 1.5px solid #dc2626; color:#dc2626; font-size:10.5pt; font-weight:bold; padding:3px 12px; text-transform:uppercase;">
                                ${classification}
                            </span>
                        </td>
                    </tr>
                </table>
            `;

            return `
            <div class="${pageClass}" id="${id}" ${watermarkCss}>
                <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:20px;">
                    ${headerHtml ? `<tr><td style="border-bottom: 2px solid #1e3a5f; padding-bottom:5px; padding-left:18mm; padding-right:18mm;">${headerHtml}</td></tr>` : ''}
                    <tr>
                        <td style="padding: 15px 18mm; vertical-align:top; padding-left:18mm; padding-right:18mm;">
                            <div class="page-content" style="padding:0;">${content}</div>
                        </td>
                    </tr>
                    <tr><td style="padding-top:8px; padding-left:18mm; padding-right:18mm;">${footerHtml}</td></tr>
                </table>
            </div>`;
        }

        return `
    <div class="${pageClass}" id="${id}" ${watermarkCss}>
        ${noHeader ? '' : mkHeader(`Page ${pageNum}`)}
        
        <table class="page-print-table" style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0;">
            <thead class="print-only-thead" style="display: none;">
                <tr>
                    <td style="height: 32mm; border: none; padding: 0;"></td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: none; padding: 0; vertical-align: top;">
                        <div class="page-content">${content}</div>
                    </td>
                </tr>
            </tbody>
            <tfoot class="print-only-tfoot" style="display: none;">
                <tr>
                    <td style="height: 28mm; border: none; padding: 0;"></td>
                </tr>
            </tfoot>
        </table>

        ${mkFooter()}
    </div>`;
    };

    let pages = '';

    // ══ COVER PAGE ════════════════════════════════════════════════
    pageNum++;
    const spk = p.spk_number || '-';
    const reportDateStr = p.report_date || todayStr;
    const reportVer = p.report_version || '1.0.0';
    const reportAuthorName = p.report_author || p.pentest_consultant_name || 'Pentest Team';
    let coverHtml = '';
    if (isDocx) {
        coverHtml = `
    <div class="${pageClass}" id="page-cover" style="padding-left:18mm; padding-right:18mm; background:#ffffff;" ${watermarkCss}>
        <table style="width:100%; border:none; border-collapse:collapse; margin-top:20px;">
            <tr>
                <td align="center" style="padding-bottom: 25px; padding-left:18mm; padding-right:18mm;">
                    ${auditorLogoSrc ? `<img src="${auditorLogoSrc}" height="80" style="height:80px; width:auto;">` : `<div style="font-size:3.5rem;font-weight:900;color:#1e3a5f;text-align:center;">i3</div>`}
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-bottom: 25px; padding-left:18mm; padding-right:18mm;">
                    <div style="text-align:center;margin-top:2.5rem;margin-bottom:1rem;">
                        <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;text-transform:uppercase;">VULNERABILITY ASSESSMENT REPORT</div>
                        <div style="font-size:19pt;font-weight:700;color:#dc2626;margin:0.25rem 0;">&amp;</div>
                        <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;margin-bottom:1.2rem;text-transform:uppercase;">PENETRATION TESTING</div>
                        <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;margin-bottom:0.5rem;">${companyName}</div>
                        <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;">${p.name}</div>
                    </div>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-bottom: 25px; padding-left:18mm; padding-right:18mm;">
                    <div style="font-size:10.5pt; margin-bottom:10px;">${lang === 'en' ? 'Work Order (SPK)' : 'Surat Perintah Kerja (SPK)'} : <strong>${spk}</strong></div>
                    ${clientLogoSrc ? `<div style="margin-bottom:12px;"><img src="${clientLogoSrc}" height="70" style="height:70px; width:auto;mix-blend-mode:multiply;"></div>` : ''}
                    <div style="text-align:center;font-size:11pt;color:#000;line-height:1.6;font-weight:800;margin-top:0.25rem;">
                        <div>${reportDateStr}</div>
                        <div>Version: ${reportVer}</div>
                        <div>Author: ${reportAuthorName}</div>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 25px; font-size:7.5pt; color:#475569; padding-left:18mm; padding-right:18mm;">
                    <div style="font-style:italic;font-weight:700;margin-bottom:0.25rem;">Copyright and other intellectual property rights</div>
                    <div style="font-style:italic;">Copyright and other intellectual property rights in any original programs, specifications, reports or other items arising in the course of, or resulting from the project shall remain the property of Inovasi Informatika Indonesia PT although CUSTOMER have a non-exclusive and non-transferable license to all such items for its own purposes. Nothing in this agreement shall enable either party to make use of any intellectual property rights vested in the other party prior to the commencement of this assignment.</div>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-top: 25px; border-top:1px solid #cbd5e1; padding-left:18mm; padding-right:18mm;">
                    <div style="font-size:8.5pt;color:#334155;line-height:1.5;text-align:center;">
                        PT. Inovasi Informatika Indonesia<br>
                        Graha BIP 6th Floor, Jalan Gatot Subroto Kav 23, Jakarta Selatan 12930<br>
                        Phone: 021 290 233 93 | Email: info@i-3.co.id
                    </div>
                    <div style="margin-top:12px;">
                        <span style="border:2px solid #dc2626;color:#dc2626;font-size:11.5pt;font-weight:bold;letter-spacing:0.1em;padding:4px 18px;text-transform:uppercase;">${classification}</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>`;
    } else {
        // --- Web PDF Preview Cover Page ---
        coverHtml = `
    <div class="${pageClass}" id="page-cover" ${watermarkCss}>
        <div class="cover-accent-bar"></div>
        <div class="page-content cover-content" style="padding:0;">
            <div class="cover-inner" style="padding:10mm 18mm;display:flex;flex-direction:column;height:100%;justify-content:space-between;">
                <!-- Header Logo i3 -->
                <div class="cover-logo-row" style="display:flex;align-items:center;justify-content:center;border-bottom:none;margin-bottom:0;padding-bottom:0;width:100%;">
                    ${auditorLogoSrc ? `<img src="${auditorLogoSrc}" style="height:90px;object-fit:contain;">` : `<div class="cover-logo-text" style="font-size:5.5rem;font-weight:900;color:#1e3a5f;letter-spacing:-.03em;line-height:1;text-align:center;">i<span>3</span></div>`}
                </div>

                <!-- Title Block -->
                <div class="cover-title-block" style="text-align:center;margin-top:1.5rem;margin-bottom:0.5rem;">
                    <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;text-transform:uppercase;">${p.header_text ? p.header_text : 'VULNERABILITY ASSESSMENT REPORT'}</div>
                    ${!p.header_text ? `<div style="font-size:19pt;font-weight:700;color:#dc2626;margin:0.1rem 0;">&amp;</div>
                    <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;margin-bottom:0.5rem;text-transform:uppercase;">PENETRATION TESTING</div>` : ''}
                    <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;margin-bottom:0.25rem;margin-top:0.5rem;">${companyName}</div>
                    <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;">${p.name}</div>
                </div>

                <!-- Client Logo & SPK & Meta details -->
                <div style="display:flex;flex-direction:column;align-items:center;margin:0.5rem 0;">
                    <div style="font-size:10.5pt;color:#000;margin-bottom:0.5rem;">${lang === 'en' ? 'Work Order (SPK)' : 'Surat Perintah Kerja (SPK)'} : <strong>${spk}</strong></div>
                    
                    <!-- Client Logo -->
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;">
                        ${clientLogoSrc ? `
                            <div style="background:#fff;padding:1rem;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.05);display:inline-block;">
                            <img src="${clientLogoSrc}" style="max-height:80px;max-width:320px;object-fit:contain;mix-blend-mode:multiply;">
                            </div>
                        ` : ''}
                    </div>

                    <div style="text-align:center;font-size:11pt;color:#000;line-height:1.5;font-weight:800;margin-top:0.5rem;">
                        <div>${reportDateStr}</div>
                        <div>Version: ${reportVer}</div>
                        <div>Author: ${reportAuthorName}</div>
                    </div>
                </div>

                <!-- Bottom Copyright Notice, Auditor Info, and Classification Badge -->
                <div style="margin-top:auto;display:flex;flex-direction:column;gap:0.75rem;width:100%;">
                    <!-- Copyright Notice -->
                    <div class="cover-notice" style="font-size:7.5pt;color:#334155;text-align:left;border-top:none;margin-top:0;padding-top:0;line-height:1.45;">
                        <div style="font-style:italic;font-weight:700;margin-bottom:0.25rem;">Copyright and other intellectual property rights</div>
                        <div style="font-style:italic;">Copyright and other intellectual property rights in any original programs, specifications, reports or other items arising in the course of, or resulting from the project shall remain the property of Inovasi Informatika Indonesia PT although CUSTOMER have a non-exclusive and non-transferable license to all such items for its own purposes. Nothing in this agreement shall enable either party to make use of any intellectual property rights vested in the other party prior to the commencement of this assignment.</div>
                    </div>

                    <!-- Company Info & Confidential Box Row -->
                    <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;width:100%;margin-top:15px;border-top:1px solid #cbd5e1;padding-top:0.75rem;">
                        <div style="font-size:8.5pt;color:#334155;line-height:1.5;text-align:center;">
                            PT. Inovasi Informatika Indonesia<br>
                            Graha BIP 6th Floor, Jalan Gatot Subroto Kav 23, Jakarta Selatan 12930<br>
                            Phone: 021 290 233 93 | Email: info@i-3.co.id
                        </div>
                        <div class="cover-conf-box" style="border:2.5px solid #dc2626;color:#dc2626;font-size:1.15rem;font-weight:800;letter-spacing:0.1em;padding:0.4rem 2rem;margin-bottom:5px;text-transform:uppercase;border-radius:0;display:inline-block;">
                            CONFIDENTIAL
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="cover-footer-bar">
            <span>${p.footer_text ? p.footer_text : 'PT. Inovasi Informatika Indonesia'}</span>
            <span>${reportDateStr}</span>
        </div>
    </div>`;
    }

    // Parse Revision History
    let revisions = [];
    try {
        revisions = JSON.parse(p.change_reference);
    } catch (e) {
        revisions = null;
    }
    if (!Array.isArray(revisions) || revisions.length === 0 || typeof revisions[0] !== 'object' || revisions[0] === null) {
        revisions = [{
            author: reportAuthorName,
            date: reportDateStr,
            version: 'v' + reportVer,
            reference: p.change_reference || 'Pembuatan Laporan'
        }];
    }

    // Parse Approvals
    let approvals = [];
    try {
        approvals = JSON.parse(p.client_approver_name);
    } catch (e) {
        approvals = null;
    }
    if (!Array.isArray(approvals) || approvals.length === 0 || typeof approvals[0] !== 'object' || approvals[0] === null) {
        approvals = [
            { name: p.project_manager_name || '-', company: 'PT. Inovasi Informatika Indonesia', approved: '' },
            { name: p.client_approver_name || '-', company: companyName, approved: '' }
        ];
    }

    const revisionRowsHTML = revisions.map(rev => `
        <tr>
            <td style="border: 1px solid #000; padding: 8px 10px; text-align: center;">${rev.author || '-'}</td>
            <td style="border: 1px solid #000; padding: 8px 10px; text-align: center;">${rev.date || '-'}</td>
            <td style="border: 1px solid #000; padding: 8px 10px; text-align: center;">${rev.version || '-'}</td>
            <td style="border: 1px solid #000; padding: 8px 10px; text-align: center; color: #dc2626; text-decoration: underline; font-weight: 500;">${tr(rev.reference || '-')}</td>
        </tr>
    `).join('');

    const approvalRowsHTML = approvals.map(app => `
        <tr>
            <td style="border: 1px solid #000; padding: 18px 10px; text-align: center; vertical-align: middle;">${app.name || '-'}</td>
            <td style="border: 1px solid #000; padding: 18px 10px; text-align: center; vertical-align: middle;">${app.company || '-'}</td>
            <td style="border: 1px solid #000; padding: 18px 10px; text-align: center; vertical-align: middle;">${app.approved || '&nbsp;'}</td>
        </tr>
    `).join('');

    // ══ REVISION HISTORY / PRATINJAU ══════════════════════════════
    const revContent = `
    <h2 style="font-size: 15pt; font-weight: 800; color: #000; text-align: center; margin-bottom: 2rem; border-bottom: none; text-transform: uppercase; letter-spacing: 0.05em;">${tr("PRATINJAU")}</h2>
    
    <h3 style="font-size: 11.5pt; font-weight: 700; color: #000; margin: 1.5rem 0 0.5rem 0; padding: 0; border-left: none; background: none;">Revision History</h3>
    <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9.5pt; margin-bottom: 2rem;">
        <thead>
            <tr style="background: #2f6ebb;">
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 25%;">Author</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 20%;">Date</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 15%;">Version</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 40%;">Change Reference</th>
            </tr>
        </thead>
        <tbody>
            ${revisionRowsHTML}
        </tbody>
    </table>

    <h3 style="font-size: 11.5pt; font-weight: 700; color: #000; margin: 2rem 0 0.5rem 0; padding: 0; border-left: none; background: none;">Approvals</h3>
    <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9.5pt;">
        <thead>
            <tr style="background: #2f6ebb;">
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 33%;">Name</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 34%;">Company</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 33%;">Approved</th>
            </tr>
        </thead>
        <tbody>
            ${approvalRowsHTML}
        </tbody>
    </table>`;
    const pratinjauHtml = mkPage('page-pratinjau', revContent);
    const hasToc = !!structure.find(s => s.id === 'toc' && s.enabled !== false);

    // ══ BAB 1: RINGKASAN EKSEKUTIF ════════════════════════════════
    const bgSec = structure.find(s => s.id === 'background');
    const bgText = tpl ? (tpl.background_text || '') : '';
    const methSec = structure.find(s => s.id === 'methodology');

    // Parse custom OWASP table
    let owaspTable = null;
    try {
        if (p.owasp_checklist) {
            owaspTable = JSON.parse(p.owasp_checklist);
        }
    } catch(e) {}

    // Fallback to default if no customized table is saved yet or it is legacy format
    if (!owaspTable || !owaspTable.columns || !owaspTable.rows) {
        const sc = stats;
        owaspTable = {
            title: "1.6. OWASP TOP 10 Application Security Risk Checklist - 2021",
            columns: [
                { id: "col_no", name: "No.", type: "text" },
                { id: "col_id", name: "ID", type: "text" },
                { id: "col_name", name: "OWASP Testing Name", type: "text" },
                { id: "col_pass", name: "Result Pass", type: "pass" },
                { id: "col_issue", name: "Issues", type: "issue" }
            ],
            rows: [
                { col_no: "1", col_id: "A01:2021", col_name: "Broken Access Control", col_pass: (sc.Critical === 0 && sc.High === 0), col_issue: !(sc.Critical === 0 && sc.High === 0) },
                { col_no: "2", col_id: "A02:2021", col_name: "Cryptographic Failures", col_pass: true, col_issue: false },
                { col_no: "3", col_id: "A03:2021", col_name: "Injection", col_pass: true, col_issue: false },
                { col_no: "4", col_id: "A04:2021", col_name: "Insecure Design", col_pass: true, col_issue: false },
                { col_no: "5", col_id: "A05:2021", col_name: "Security Misconfiguration", col_pass: (sc.Medium === 0), col_issue: !(sc.Medium === 0) },
                { col_no: "6", col_id: "A06:2021", col_name: "Vulnerable and Outdated Components", col_pass: true, col_issue: false },
                { col_no: "7", col_id: "A07:2021", col_name: "Identification and Authentication Failures", col_pass: true, col_issue: false },
                { col_no: "8", col_id: "A08:2021", col_name: "Software and Data Integrity Failures", col_pass: true, col_issue: false },
                { col_no: "9", col_id: "A09:2021", col_name: "Security Logging and Monitoring Failures", col_pass: true, col_issue: false },
                { col_no: "10", col_id: "A10:2021", col_name: "Server-Side Request Forgery (SSRF)", col_pass: true, col_issue: false }
            ]
        };
    }

    const owaspTitle = owaspTable.title || "1.6. OWASP TOP 10 Application Security Risk Checklist - 2021";
    const owaspColumns = owaspTable.columns || [];
    const owaspRows = owaspTable.rows || [];

    const owaspTableHTML = `
    <h3 class="ssh">${tr(owaspTitle)}</h3>
    <table class="tbl">
        <thead>
            <tr>
                ${owaspColumns.map(col => {
                    let style = "";
                    if (col.type === 'pass' || col.type === 'issue') {
                        style = ' style="text-align:center;"';
                    }
                    return `<th${style}>${tr(col.name)}</th>`;
                }).join('')}
            </tr>
        </thead>
        <tbody>
            ${owaspRows.map(row => `
                <tr>
                    ${owaspColumns.map(col => {
                        const val = row[col.id];
                        let style = "";
                        let displayVal = val ?? "";
                        if (col.type === 'pass') {
                            style = ' style="text-align:center;font-size:1.1rem;font-weight:bold;"';
                            displayVal = val ? '<span style="color:#16a34a;">&#10003;</span>' : '-';
                        } else if (col.type === 'issue') {
                            style = ' style="text-align:center;font-size:1.1rem;font-weight:bold;"';
                            displayVal = val ? '<span style="color:#dc2626;">&#10003;</span>' : '-';
                        } else if (col.id === 'col_id') {
                            style = ' style="font-weight:700;color:#1e3a5f;"';
                        }
                        return `<td${style}>${tr(displayVal)}</td>`;
                    }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    `;

    const defaultIntro = lang === 'en'
        ? `PT. Inovasi Informatika Indonesia (I-3) as a third party conducted a security audit for the application owned by <strong>${companyName}</strong>, held on ${todayStr} through penetration testing. The purpose of this testing is to identify vulnerabilities that could be exploited by attackers.`
        : `PT. Inovasi Informatika Indonesia (I-3) sebagai pihak ketiga melakukan audit keamanan untuk aplikasi milik <strong>${companyName}</strong>, yang diselenggarakan pada ${todayStr} melalui pengujian penetrasi. Tujuan dari pengujian ini adalah untuk mengidentifikasi kerentanan yang dapat dimanfaatkan oleh penyerang.`;

    const flowItems = [];

    // --- BAB 1 ---
    const execSummaryPart1 = `
    <h2 class="sh-blue">${tr("1. RINGKASAN EKSEKUTIF")}</h2>
    <div class="tb">
        ${p.summary ? renderContent(p.summary) : `<p>${defaultIntro}</p>`}
    </div>

    <h3 class="ssh">${tr("1.1. Latar Belakang")}</h3>
    <div class="tb">${renderContent(bgText) || renderContent(p.description)}</div>

    <h3 class="ssh">${tr("1.2. Ruang Lingkup")}</h3>
    <table class="tbl">
        <thead><tr><th>${tr("No.")}</th><th>${lang === 'en' ? 'Device / Application' : 'Perangkat / Aplikasi'}</th><th>URL/IP</th><th>Detail</th><th>${lang === 'en' ? 'Methodology' : 'Metodologi'}</th></tr></thead>
        <tbody>
            <tr>
                <td style="text-align:center;">1</td>
                <td>${p.name || 'Aplikasi'}</td>
                <td><code>${p.scope || '-'}</code></td>
                <td>${lang === 'en' ? 'Web Application' : 'Aplikasi Web'}</td>
                <td>${p.methodology || 'Black box'}</td>
            </tr>
        </tbody>
    </table>

    <h3 class="ssh">${tr("1.3. Skenario Penetration Testing")}</h3>
    <div class="tb">${renderContent(p.access_info || (lang === 'en' ? 'Pentester performs scanning related to OS, port, and open vulnerabilities as an internet user, application user, and also as an admin.' : 'Pentester melakukan scanning terkait informasi OS, port, dan celah yang terbuka sebagai pengguna internet, pengguna aplikasi, juga sebagai admin aplikasi.'))}</div>

    <h3 class="ssh">${tr("1.4. Batasan Pekerjaan")}</h3>
    <div class="tb">${renderContent(p.out_of_scope || (lang === 'en' ? 'Delivery of services described in the scope of work does not cover the following:\n- Vulnerability Assessment & Penetration Testing of systems outside the systems listed in this document.\n- Operational or disaster issues not caused by I3.' : 'Pengantaran jasa yang dijelaskan pada ruang lingkup pekerjaan tidak mencakupi hal-hal berikut ini:\n- Vulnerability Assessment & Penetration Testing terhadap sistem di luar sistem yang tercantum di dokumen ini.\n- Masalah operasional atau disaster, yang bukan disebabkan oleh I3.'))}</div>
    `;
    flowItems.push({
        type: 'general',
        height: estimateHtmlHeight(execSummaryPart1),
        html: execSummaryPart1
    });

    let findingsChartHtml = '';
    if (findings && findings.length > 0) {
        const statsChart = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
        findings.forEach(f => {
            let sev = f.severity;
            if (sev === 'Critical' || sev === 'High' || sev === 'Medium' || sev === 'Low' || sev === 'Info') {
                statsChart[sev]++;
            }
        });
        const maxStat = Math.max(...Object.values(statsChart), 1);
        
        findingsChartHtml = `
        <div style="margin-top: 1rem; margin-bottom: 25px; padding: 15px 15px 25px 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; page-break-inside: avoid;">
            <div style="font-size: 10pt; font-weight: bold; color: #334155; margin-bottom: 25px; text-align: center;">${tr("Distribusi Tingkat Kerentanan")}</div>
            <div style="text-align: center;">
                ${['Critical', 'High', 'Medium', 'Low', 'Info'].map(sev => {
                    const count = statsChart[sev];
                    const barHeightPx = Math.max((count / maxStat) * 80, 3);
                    const sc = sevColor[sev] || '#475569';
                    return `
                    <div style="display: inline-block; width: 18%; vertical-align: bottom; text-align: center;">
                        <div style="font-size: 10pt; font-weight: bold; color: ${sc}; margin-bottom: 5px;">${count}</div>
                        <div style="background: ${sc}; height: ${barHeightPx}px; width: 75%; margin: 0 auto; border-radius: 3px 3px 0 0;"></div>
                        <div style="font-size: 8pt; font-weight: bold; color: #475569; margin-top: 8px; border-top: 1px solid ${sc}; padding-top: 5px; opacity: 0.8;">${sev}</div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    const timelineHtml = `
    <h3 class="ssh">${tr("1.5. Timeline Kegiatan")}</h3>
    <div class="tb">${renderContent(p.report_date || (lang === 'en' ? `Vulnerability Assessment and Penetration Testing activities were conducted on: ${p.start_date || todayStr}.` : `Aktivitas kegiatan Vulnerability Assessment dan Penetration Testing dilakukan pada: ${p.start_date || todayStr}.`))}</div>
    `;
    flowItems.push({
        type: 'general',
        height: estimateHtmlHeight(timelineHtml),
        html: timelineHtml
    });

    if (owaspTableHTML) {
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(owaspTableHTML),
            html: owaspTableHTML
        });
    }

    const chartTitleHtml = `<h3 class="ssh">${tr("1.7. Ringkasan Temuan Celah Keamanan")}</h3>`;
    if (findingsChartHtml) {
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(chartTitleHtml + findingsChartHtml),
            html: chartTitleHtml + findingsChartHtml
        });
    } else {
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(chartTitleHtml),
            html: chartTitleHtml
        });
    }

    if (findings && findings.length > 0) {
        const chunkSize = 15;
        for (let i = 0; i < findings.length; i += chunkSize) {
            const chunkFindings = findings.slice(i, i + chunkSize);
            const isLastChunk = (i + chunkSize >= findings.length);
            
            let tableChunkHtml = `
            <table class="tbl">
                <thead><tr><th>${tr("No.")}</th><th>${tr("Temuan")}</th><th>${tr("Nilai CVSS")}</th><th>${tr("Klasifikasi Risiko")}</th><th>${tr("Status")}</th></tr></thead>
                <tbody>
                ${chunkFindings.map((f, idx) => `
                <tr>
                    <td style="text-align:center;">${i + idx + 1}</td>
                    <td><strong>${f.title}</strong></td>
                    <td style="text-align:center;font-weight:700;color:${sevColor[f.severity]||'#475569'};">${(f.cvss_score||0).toFixed(1)}</td>
                    <td><span class="svb" style="background:${sevBg[f.severity]||'#f8fafc'};color:${sevColor[f.severity]||'#475569'};">${f.severity?.toUpperCase()}</span></td>
                    <td style="color:${(f.status==='Open'||f.finding_status==='Open')?'#dc2626':'#16a34a'};font-weight:700;">${tr(f.status||f.finding_status||'OPEN')}</td>
                </tr>`).join('')}
                </tbody>
            </table>
            `;
            
            if (isLastChunk) {
                tableChunkHtml += `
                <div class="risk-overall" style="border-color:${overallColor};color:${overallColor};">Overall Risk: <strong>${overallRisk}</strong></div>
                <div class="tb" style="margin-top:1rem;"><p>${lang === 'en' ? 'The main part of this report explains each risk in detail, followed by recommendations on technical resolution steps.' : 'Bagian utama dari laporan ini menjelaskan setiap risiko yang ada secara rinci, diikuti dengan rekomendasi tentang langkah-langkah penyelesaian teknis.'}</p></div>
                `;
            }
            
            flowItems.push({
                type: 'general',
                height: estimateHtmlHeight(tableChunkHtml) + 50,
                html: tableChunkHtml
            });
        }
    } else {
        const emptyTableHtml = `
        <table class="tbl">
            <thead><tr><th>${tr("No.")}</th><th>${tr("Temuan")}</th><th>${tr("Nilai CVSS")}</th><th>${tr("Klasifikasi Risiko")}</th><th>${tr("Status")}</th></tr></thead>
            <tbody><tr><td colspan="5" style="text-align:center;color:#94a3b8;">${tr("Tidak ada temuan.")}</td></tr></tbody>
        </table>
        <div class="risk-overall" style="border-color:${overallColor};color:${overallColor};">Overall Risk: <strong>${overallRisk}</strong></div>
        <div class="tb" style="margin-top:1rem;"><p>${lang === 'en' ? 'The main part of this report explains each risk in detail, followed by recommendations on technical resolution steps.' : 'Bagian utama dari laporan ini menjelaskan setiap risiko yang ada secara rinci, diikuti dengan rekomendasi tentang langkah-langkah penyelesaian teknis.'}</p></div>
        `;
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(emptyTableHtml),
            html: emptyTableHtml
        });
    }

    // --- BAB 2 ---
    let flowData = ['Planning', 'Intelligence Gathering', 'Assessment', 'Testing', 'Reporting'];
    try {
        if (p.methodology_flow) flowData = JSON.parse(p.methodology_flow);
    } catch(e) {}

    let riskData = lang === 'en' ? [
        { score: '0.0', severity: 'NONE', def: 'No vulnerabilities exist.' },
        { score: '0.1 - 3.9', severity: 'LOW', def: 'Vulnerabilities cannot be exploited but will reduce the attack surface.' },
        { score: '4.0 - 6.9', severity: 'MEDIUM', def: 'Vulnerabilities exist but cannot be exploited or require additional steps.' },
        { score: '7.0 - 8.9', severity: 'HIGH', def: 'Exploitation is difficult but can lead to privilege escalation and data loss.' },
        { score: '9.0 - 10.0', severity: 'CRITICAL', def: 'Exploitation is very easy and typically results in system-level compromise.' }
    ] : [
        { score: '0.0', severity: 'NONE', def: 'Tidak ada kerentanan yang ada.' },
        { score: '0.1 - 3.9', severity: 'LOW', def: 'Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan.' },
        { score: '4.0 - 6.9', severity: 'MEDIUM', def: 'Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah tambahan.' },
        { score: '7.0 - 8.9', severity: 'HIGH', def: 'Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan kehilangan data.' },
        { score: '9.0 - 10.0', severity: 'CRITICAL', def: 'Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.' }
    ];
    try {
        if (p.risk_assessment) riskData = JSON.parse(p.risk_assessment);
    } catch(e) {}

    const flowColors = ['#22c55e', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6'];

    const methodologyHtml1 = `
    <h2 class="sh-blue">${tr("2. METODOLOGI")}</h2>
    <div class="tb">
        ${renderContent(tpl ? tpl.methodology_text : (lang === 'en' ? 'PT Inovasi Informatika Indonesia uses frameworks tailored to targets such as the Open Web Application Security Project (OWASP), Penetration Testing Execution Standard (PTES), etc.\n\nThis testing follows industry standards such as OWASP (Open Web Application Security Project) and PTES (Penetration Testing Execution Standard) with stages of information gathering, vulnerability mapping, exploitation, and impact analysis.' : 'PT Inovasi Informatika Indonesia menggunakan framework yang disesuaikan dengan target seperti Open Web Application Security Project (OWASP), Penetration Testing Execution Standard (PTES), dll.\n\nPengujian ini mengikuti standar industri seperti OWASP (Open Web Application Security Project) dan PTES (Penetration Testing Execution Standard) dengan tahapan pengumpulan informasi, pemetaan kerentanan, eksploitasi, hingga analisis dampak.'))}
    </div>

    ${isDocx ? `
    <table style="width:100%; border:none; border-collapse:collapse; margin:15px 0;">
        <tr>
            ${flowData.map((f, i) => `
                <td align="center" style="background:${flowColors[i % flowColors.length] || '#3b82f6'}; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; font-size:10px; text-align:center; width:16%;">${tr(f)}</td>
                ${i < flowData.length - 1 ? '<td align="center" style="font-size:12px; color:#64748b; width:4%;">&#9654;</td>' : ''}
            `).join('')}
        </tr>
    </table>
    ` : `
    <div class="methodology-flow" style="display:flex; align-items:center; justify-content:center; flex-wrap:nowrap; gap:5px; margin: 15px 0;">
        ${flowData.map((f, i) => `
            <div class="mf-step" style="background:${flowColors[i % flowColors.length] || '#3b82f6'}; color:#fff; font-weight:700; padding:10px 15px; border-radius:4px; font-size:12px; text-align:center; min-width:80px;">${tr(f)}</div>
            ${i < flowData.length - 1 ? '<div class="mf-arrow" style="font-size:16px; color:#64748b;">&#9654;</div>' : ''}
        `).join('')}
    </div>
    `}

    <div class="tb" style="margin-top:1.5rem;">
        ${renderContent(p.flow_description || (lang === 'en' ? `<strong>Planning</strong> — Agreement between parties and rules of engagement.\n\n<strong>Information Gathering</strong> — Actively and passively collecting information.\n\n<strong>Assessment</strong> — Finding vulnerabilities (Vulnerability Assessment) and simulating attacks.\n\n<strong>Testing</strong> — Performing testing (Penetration Testing) based on OWASP Top 10.\n\n<strong>Report</strong> — Analyzing data and writing the report.` : `<strong>Planning</strong> — Perjanjian antar pihak dan aturan keterlibatan.\n\n<strong>Information Gathering</strong> — Mengumpulkan informasi secara aktif dan pasif.\n\n<strong>Assessment</strong> — Mencari celah (Vulnerability Assessment) dan mensimulasikan serangan.\n\n<strong>Testing</strong> — Melakukan testing (Penetration Testing) berdasarkan OWASP Top 10.\n\n<strong>Report</strong> — Menganalisis data dan menuliskan laporan.`))}
    </div>

    <h3 class="ssh">${tr("2.1. Risk Assessment")}</h3>
    <table class="tbl">
        <thead><tr><th>CVSS Score</th><th>${tr("Severity")}</th><th>${tr("Definition")}</th></tr></thead>
        <tbody>
            ${riskData.map(r => `
                <tr>
                    <td style="font-weight:700;">${r.score}</td>
                    <td><span class="svb" style="background:${sevBg[r.severity.charAt(0).toUpperCase() + r.severity.slice(1).toLowerCase()] || '#f8fafc'}; color:${sevColor[r.severity.charAt(0).toUpperCase() + r.severity.slice(1).toLowerCase()] || '#64748b'};">${tr(r.severity.toUpperCase())}</span></td>
                    <td>${tr(r.def)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    `;

    const methodologyHtml2 = `
    <h3 class="ssh">${tr("2.2. Penetration Testing Tools")}</h3>
    <table class="tbl">
        <thead><tr><th>${lang === 'en' ? 'Information Gathering' : 'Information Gathering'}</th><th>${lang === 'en' ? 'Assessment' : 'Assessment'}</th><th>${lang === 'en' ? 'Exploit/Tools' : 'Exploit/Tools'}</th></tr></thead>
        <tbody>
            <tr>
                <td>
                    ${(() => {
                        const tools = (p.used_tools || 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb').split(',');
                        // Column 1: first 4 tools
                        return tools.slice(0, 4).map(t => `<div>${t.trim()}</div>`).join('');
                    })()}
                </td>
                <td>
                    ${(() => {
                        const tools = (p.used_tools || 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb').split(',');
                        // Column 2: next 5 tools
                        return tools.slice(4, 9).map(t => `<div>${t.trim()}</div>`).join('');
                    })()}
                </td>
                <td>
                    ${(() => {
                        const tools = (p.used_tools || 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb').split(',');
                        // Column 3: remaining tools
                        return tools.slice(9).map(t => `<div>${t.trim()}</div>`).join('');
                    })()}
                </td>
            </tr>
        </tbody>
    </table>
    `;
    flowItems.push({
        type: 'general',
        height: estimateHtmlHeight(methodologyHtml1),
        html: methodologyHtml1
    });
    flowItems.push({
        type: 'general',
        height: estimateHtmlHeight(methodologyHtml2),
        html: methodologyHtml2
    });

    // --- BAB 3 ---
    let techReport = { intro: '', subsections: [] };
    try { if (p.technical_report) techReport = JSON.parse(p.technical_report); } catch(e) {}

    const defaultSubs = lang === 'en' ? [
        { id: 'sub-31',  title: '3.1. Intelligence Gathering',
          content: 'The first stage of testing begins with the intelligence gathering process to determine the type of operating system, patch level, running services, etc.\n\nTools used: NMAP, Paramspider, Nikto, Wafw00f, Acunetix, Burpsuite Pro, SQLmap, Dalfox, Slowhttptest.' },
        { id: 'sub-311', title: '3.1.1 Web Application and Server Enumeration',
          content: 'Web Application Enumeration is the penetration testing phase to discover and gather information about the web application and technologies used in the website.' },
        { id: 'sub-32',  title: '3.2. Vulnerability Assessment',
          content: 'In this stage, the Pentester performs vulnerability scanning, classifies the type of vulnerability, measures severity based on CVSS, and informs the status of the security vulnerability.\n\nTools: Burpsuite Pro, Acunetix, OWASP ZAP, Dalfox, Nessus Pro.' },
        { id: 'sub-33',  title: '3.3. Penetration Testing (Exploitation)',
          content: 'In this stage, the Pentester continues exploitation activities based on the results of the Vulnerability Assessment to simulate attacks of a real attacker.' },
        { id: 'sub-331', title: '3.3.1 Finding Details', content: '' }
    ] : [
        { id: 'sub-31',  title: '3.1. Intelligence Gathering',
          content: 'Tahap pertama pengujian dimulai dengan proses pengumpulan informasi intelijen untuk menentukan jenis sistem operasi, tingkat patch, layanan yang berjalan, dll.\n\nAlat yang digunakan: NMAP, Paramspider, Nikto, Wafw00f, Acunetix, Burpsuite Pro, SQLmap, Dalfox, Slowhttptest.' },
        { id: 'sub-311', title: '3.1.1 Web Application and Server Enumeration',
          content: 'Web Application Enumeration adalah fase pengujian penetrasi untuk menemukan dan mengumpulkan informasi tentang aplikasi dan teknologi yang digunakan di situs web.' },
        { id: 'sub-32',  title: '3.2. Vulnerability Assessment',
          content: 'Pada tahap ini Pentester melakukan pemindaian kerentanan, mengklasifikasikan jenis kerentanan, mengukur severity berdasarkan CVSS, dan menginformasikan status celah keamanan tersebut.\n\nAlat: Burpsuite Pro, Acunetix, OWASP ZAP, Dalfox, Nessus Pro.' },
        { id: 'sub-33',  title: '3.3. Penetration Testing (Exploitation)',
          content: 'Pada tahap ini Pentester melanjutkan kegiatan exploitasi berdasarkan hasil Vulnerability Assessment, untuk mensimulasikan serangan attacker yang sesungguhnya.' },
        { id: 'sub-331', title: '3.3.1 Rincian Temuan', content: '' }
    ];

    const defaultTechnicalIntro = lang === 'en'
        ? 'The technical report is divided into 3 main parts: Intelligence Gathering, Vulnerability Assessment, and Penetration Testing (Exploitation) which explain each security vulnerability found.'
        : 'Laporan teknis terbagi menjadi 3 bagian utama yaitu: Intelligence Gathering, Vulnerability Assessment dan Penetration Testing (Exploitation) yang menjelaskan setiap kerentanan keamanan yang ditemukan.';

    const activeSubs = (Array.isArray(techReport.subsections) && techReport.subsections.length > 0)
        ? techReport.subsections
        : defaultSubs;

    const introHtml = techReport.intro
        ? `<div class="tb">${renderContent(techReport.intro)}</div>`
        : `<div class="tb"><p>${defaultTechnicalIntro}</p></div>`;

    let subsHtml = '';
    activeSubs.forEach((sub, si) => {
        const isTableHeading = sub.id === 'sub-331' || sub.title.toLowerCase().includes('rincian temuan') || sub.title.toLowerCase().includes('finding details');
        subsHtml += `<h3 class="ssh">${sub.title}</h3>`;
        if (!isTableHeading && sub.content) {
            subsHtml += `<div class="tb">${renderContent(sub.content)}</div>`;
        }
    });

    const has331 = activeSubs.some(s => s.id === 'sub-331' || s.title.toLowerCase().includes('rincian temuan') || s.title.toLowerCase().includes('finding details'));
    if (!has331) subsHtml += `<h3 class="ssh">3.3.1 ${lang === 'en' ? 'Finding Details' : 'Rincian Temuan'}</h3>`;

    const findingsTableHtml = findings && findings.length > 0 ? `
    <table class="tbl" style="margin-top: 1rem; width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9.5pt;">
        <thead>
            <tr style="background: #2f6ebb;">
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 8%;">${tr("No.")}</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; font-weight: 700; width: 45%;">${tr("Judul Temuan")}</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; font-weight: 700; width: 22%;">${tr("Sistem Terdampak")}</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 10%;">${tr("CVSS")}</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 15%;">${tr("Severity")}</th>
            </tr>
        </thead>
        <tbody>
        ${findings.map((f, i) => {
            const sc = sevColor[f.severity] || '#475569';
            const sb = sevBg[f.severity] || '#f8fafc';
            
            let affectedHtml = '-';
            if (f.affected_system) {
                const parts = f.affected_system.split(/[\n,\s]+/).filter(Boolean);
                if (parts.length > 0) {
                    affectedHtml = '<ul style="margin: 0; padding-left: 15px; text-align: left; list-style-type: disc;">' + 
                        parts.map(p => '<li style="margin-bottom: 2px;">' + p + '</li>').join('') + 
                        '</ul>';
                }
            }

            return `
            <tr>
                <td style="border: 1px solid #000; padding: 8px 10px; text-align: center;">${i+1}</td>
                <td style="border: 1px solid #000; padding: 8px 10px;"><strong>${f.title}</strong></td>
                <td style="border: 1px solid #000; padding: 8px 10px; font-family: monospace; font-size: 8pt; word-break: break-all;">${affectedHtml}</td>
                <td style="border: 1px solid #000; padding: 8px 10px; text-align: center; font-weight: 700; color: ${sc};">${(f.cvss_score||0).toFixed(1)}</td>
                <td style="border: 1px solid #000; padding: 8px 10px; text-align: center;">
                    <span class="svb" style="background: ${sb}; color: ${sc}; font-weight: bold; border-radius: 4px; padding: 2px 6px;">${f.severity?.toUpperCase()}</span>
                </td>
            </tr>`;
        }).join('')}
        </tbody>
    </table>
    ` : `<p style="color:#94a3b8;font-style:italic;">${tr("Tidak ada temuan kerentanan.")}</p>`;

    // Split Bab 3 into separate flow items to allow MS Word-style continuous flow
    const techIntroContent = `
    <h2 class="sh-blue">${tr("3. LAPORAN TEKNIS")}</h2>
    ${introHtml}
    `;
    flowItems.push({
        type: 'general',
        height: estimateHtmlHeight(techIntroContent),
        html: techIntroContent
    });

    activeSubs.forEach((sub, si) => {
        const isTableHeading = sub.id === 'sub-331' || sub.title.toLowerCase().includes('rincian temuan') || sub.title.toLowerCase().includes('finding details');
        let itemHtml = `<h3 class="ssh">${sub.title}</h3>`;
        if (!isTableHeading && sub.content) {
            itemHtml += `<div class="tb">${renderContent(sub.content)}</div>`;
        }
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(itemHtml),
            html: itemHtml
        });
    });

    if (!has331) {
        flowItems.push({
            type: 'general',
            height: 35,
            html: `<h3 class="ssh">3.3.1 ${lang === 'en' ? 'Finding Details' : 'Rincian Temuan'}</h3>`
        });
    }

    if (findings && findings.length > 0) {
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(findingsTableHtml),
            html: findingsTableHtml
        });
    }

    // --- FINDINGS details ---
    if (findings && findings.length > 0) {
        findings.forEach((f, idx) => {
            const sev = f.severity || 'Info';
            const sc = sevColor[sev] || '#475569';
            const sb = sevBg[sev] || '#f8fafc';
            const figBase = idx + 1;

            const estimateRowHeight = (type, val) => {
                if (!val) return 40;
                const str = String(val).trim();
                if (!str || str === '-') return 40;

                switch (type) {
                    case 'title': return Math.max(45, Math.ceil(str.length / 50) * 22);
                    case 'affected': return Math.max(45, Math.ceil(str.length / 60) * 22);
                    case 'cvss': return 110;
                    case 'status':
                    case 'retest_status': return 45;
                    case 'poc':
                        const isImg = str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://');
                        if (isImg) return 320; 
                        return Math.max(45, Math.ceil(str.length / 70) * 22);
                    case 'script':
                        const lines = str.split('\n').length;
                        return Math.max(50, lines * 18 + 20);
                    case 'references':
                        const refCount = str.split('\n').filter(r => r.trim()).length;
                        return Math.max(45, refCount * 22 + 20);
                    default:
                        const rawText = str.replace(/<[^>]*>/g, '');
                        return Math.max(45, Math.ceil(rawText.length / 70) * 22);
                }
            };

            flowItems.push({
                type: 'heading',
                height: 40,
                html: `<h3 class="ssh" style="border-left-color:${sc}; font-size:11pt; font-weight:800; margin-top:1.8rem;">3.3.1.${idx+1} ${f.title}</h3>`
            });

            const rowsData = [
                { type: 'title', val: f.title, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">Finding Title</td><td style="padding:8px 12px; border:1px solid #000; font-weight:bold; font-size:10pt;">${f.title}</td></tr>` },
                { type: 'affected', val: f.affected_system, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">Affected System</td><td style="padding:8px 12px; border:1px solid #000; color:#0f62fe; text-decoration:underline; font-weight:500; font-family:monospace; word-break:break-all;">${f.affected_system || '-'}</td></tr>` },
                { type: 'cvss', val: f.cvss_vector, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">CVSS Calculator</td><td style="padding:8px 12px; border:1px solid #000; font-weight:500;"><div style="font-weight:bold; margin-bottom:4px;">${f.cvss_version || 'CVSS v3.1'}</div><div style="font-family:monospace; font-size:8.5pt; margin-bottom:4px; word-break:break-all;"><strong>Vector:</strong> ${f.cvss_vector || '-'}</div><div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;"><strong>Score:</strong> ${(f.cvss_score || 0).toFixed(1)} <span style="background-color: ${sevBg[f.severity] || '#eff6ff'}; color: ${sevColor[f.severity] || '#0284c7'}; padding: 3px 12px; border-radius: 9999px; font-weight: 600; font-size: 8.5pt; display: inline-block; border: 1px solid ${sevColor[f.severity]}33;">${f.severity || 'Info'}</span></div></td></tr>` },
                { type: 'status', val: f.finding_status || f.status, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">Finding Status</td><td style="padding:8px 12px; border:1px solid #000;">${(() => { const val = f.finding_status || f.status || 'Open'; const isOp = val.toLowerCase() === 'open'; return `<span style="background-color: ${isOp ? '#def7ec' : '#e0f2fe'}; color: ${isOp ? '#03543f' : '#0369a1'}; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 8.5pt; display: inline-block; border: 1px solid ${isOp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)'};">${val}</span>`; })()}</td></tr>` },
                { type: 'retest_status', val: f.status || f.finding_status, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">Retest Status</td><td style="padding:8px 12px; border:1px solid #000;">${(() => { const val = f.status || f.finding_status || 'Open'; const valL = val.toLowerCase(); const bg = valL === 'open' ? '#def7ec' : (valL === 'fixed' || valL === 'closed' ? '#e0f2fe' : '#fef3c7'); const fg = valL === 'open' ? '#03543f' : (valL === 'fixed' || valL === 'closed' ? '#0369a1' : '#b45309'); const bd = valL === 'open' ? 'rgba(16, 185, 129, 0.2)' : (valL === 'fixed' || valL === 'closed' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(245, 158, 11, 0.2)'); return `<span style="background-color: ${bg}; color: ${fg}; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 8.5pt; display: inline-block; border: 1px solid ${bd};">${val}</span>`; })()}</td></tr>` },
                { type: 'description', val: f.description, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Description</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${renderContent(f.description)}</td></tr>` },
                { type: 'poc', val: f.poc, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Proof of Vulnerability (PoC)</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${f.poc ? ((f.poc.trim().startsWith('data:image/') || f.poc.trim().startsWith('http://') || f.poc.trim().startsWith('https://')) ? `<div style="text-align:center; margin:0.5rem 0;"><img src="${f.poc}" style="max-width:100%; border:1px solid #000;" alt="PoC"><div style="font-size:7.5pt; color:#64748b; margin-top:4px;">${lang === 'en' ? 'Figure' : 'Gambar'} ${figBase}. Proof of Concept</div></div>` : renderContent(f.poc)) : '<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` },
                { type: 'exploitation', val: f.exploitation, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Exploitation</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${renderContent(f.exploitation)}</td></tr>` },
                { type: 'impact', val: f.impact, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Impact</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${renderContent(f.impact)}</td></tr>` },
                { type: 'script_payload', val: f.script_payload, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Script/Payload</td><td style="padding:8px 12px; border:1px solid #000;">${f.script_payload ? `<pre style="font-family:'Courier New', monospace; font-size:8pt; background:#f1f5f9; padding:6px 10px; border:1px solid #cbd5e1; border-radius:3px; overflow-x:auto; margin:0;"><code>${f.script_payload}</code></pre>` : '<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` },
                { type: 'solution', val: f.solution, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Solution</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${renderContent(f.solution)}</td></tr>` },
                { type: 'reference', val: f.reference, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">References</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${f.reference ? `<ul style="margin:0; padding-left:1.2rem;">${f.reference.split('\n').filter(r=>r.trim()).map(r=>`<li><a href="${r.trim()}" style="color:#0f62fe; word-break:break-all;" target="_blank">${r.trim()}</a></li>`).join('')}</ul>` : '<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` },
                { type: 'step_reproduce', val: f.step_reproduce, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Steps to Reproduce</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${renderContent(f.step_reproduce)}</td></tr>` },
                { type: 'cwe', val: f.cwe, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">CWE (Common Weakness Enumeration)</td><td style="padding:8px 12px; border:1px solid #000;">${f.cwe || '-'}</td></tr>` },
                { type: 'mitre_attack', val: f.mitre_attack, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">MITRE ATT&CK Technique</td><td style="padding:8px 12px; border:1px solid #000;">${f.mitre_attack || '-'}</td></tr>` },
                { type: 'iso_27001', val: f.iso_27001, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">ISO 27001 Annex A Control</td><td style="padding:8px 12px; border:1px solid #000;">${f.iso_27001 || '-'}</td></tr>` },
                { type: 'nist_control', val: f.nist_control, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">NIST SP 800-53 Control</td><td style="padding:8px 12px; border:1px solid #000;">${f.nist_control || '-'}</td></tr>` },
                { type: 'ptes_phase', val: f.ptes_phase, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%;">PTES Assessment Phase</td><td style="padding:8px 12px; border:1px solid #000;">${f.ptes_phase || '-'}</td></tr>` },
                { type: 'retest_evidence', val: f.retest_evidence, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:25%; vertical-align:top;">Retest Evidence</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${renderContent(f.retest_evidence)}</td></tr>` }
            ];

            rowsData.forEach(row => {
                flowItems.push({
                    type: 'row',
                    findingIdx: idx,
                    severityColor: sc,
                    height: estimateRowHeight(row.type, row.val),
                    html: row.html
                });
            });
        });
    }

    // --- CUSTOM CHAPTERS ---
    (structure || []).forEach(sec => {
        if (!sec.enabled || ['cover','toc','background','methodology','findings','appendix'].includes(sec.id)) return;
        
        let c = `<h2 class="sh-blue">${sec.title}</h2>`;
        c += `<div class="tb">${renderContent(sec.content)}</div>`;
        (sec.subsections || []).forEach(sub => {
            c += `<h3 class="ssh">${sub.title}</h3><div class="tb">${renderContent(sub.content)}</div>`;
        });
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(c),
            html: c
        });
    });

    // --- APPENDIX ---
    const appSec = structure.find(s => s.id === 'appendix' && s.enabled !== false);
    if (appSec && p.appendix) {
        const appHtml = `<h2 class="sh-blue">${appSec.title || 'APPENDIX'}</h2><div class="tb">${renderContent(p.appendix)}</div>`;
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(appHtml),
            html: appHtml
        });
    }

    // Tag each flow item with sectionId based on heading HTML inside the items
    let currentSectionId = 'background';
    const appSecObj = structure.find(s => s.id === 'appendix');
    const customSecObjs = (structure || []).filter(s => !['cover','toc','background','methodology','findings','appendix'].includes(s.id));

    flowItems.forEach(item => {
        const html = item.html;
        if (html.includes('<h2 class="sh-blue">1. RINGKASAN EKSEKUTIF</h2>')) {
            currentSectionId = 'background';
        } else if (html.includes('<h2 class="sh-blue">2. METODOLOGI</h2>')) {
            currentSectionId = 'methodology';
        } else if (html.includes('<h2 class="sh-blue">3. LAPORAN TEKNIS</h2>')) {
            currentSectionId = 'findings';
        } else if (appSecObj && html.includes(`<h2 class="sh-blue">${appSecObj.title || 'APPENDIX'}</h2>`)) {
            currentSectionId = 'appendix';
        } else {
            // Check dynamic sections
            for (const sec of customSecObjs) {
                if (html.includes(`<h2 class="sh-blue">${sec.title}</h2>`)) {
                    currentSectionId = sec.id;
                    break;
                }
            }
        }
        item.sectionId = currentSectionId;
    });

    // Sort flowItems according to the order of sections in the structure array
    const sectionOrderMap = {};
    (structure || []).forEach((sec, idx) => {
        sectionOrderMap[sec.id] = idx;
    });

    flowItems.sort((a, b) => {
        const orderA = sectionOrderMap[a.sectionId] !== undefined ? sectionOrderMap[a.sectionId] : 999;
        const orderB = sectionOrderMap[b.sectionId] !== undefined ? sectionOrderMap[b.sectionId] : 999;
        return orderA - orderB;
    });

    // Paginate all flow items across the entire document body
    const pageChunks = [];
    let currentChunk = [];
    let currentChunkHeight = 30; // base margin space

    flowItems.forEach(item => {
        // Use 950 as threshold to fill the page properly
        if (currentChunkHeight + item.height > 950 && currentChunk.length > 0) {
            pageChunks.push(currentChunk);
            currentChunk = [item];
            currentChunkHeight = 30 + item.height;
        } else {
            currentChunk.push(item);
            currentChunkHeight += item.height;
        }
    });
    if (currentChunk.length > 0) {
        pageChunks.push(currentChunk);
    }

    // Generate dynamic TOC rows from chunks
    const dynamicTocRows = [];
    let currentMainChapter = null;

    // Body pages start at 4 (since Cover=1, Pratinjau=2, TOC=3)
    pageChunks.forEach((chunkItems, chunkIdx) => {
        const pageNumVal = 4 + chunkIdx;
        
        chunkItems.forEach(item => {
            let match;
            const h2Regex = /<h2 class="sh-blue"[^>]*>(.*?)<\/h2>/g;
            while ((match = h2Regex.exec(item.html)) !== null) {
                const titleText = match[1].replace(/<[^>]*>/g, '').trim();
                if (titleText.toLowerCase() === 'daftar isi' || titleText.toLowerCase() === 'pratinjau') continue;
                
                currentMainChapter = {
                    title: titleText,
                    pg: String(pageNumVal),
                    children: []
                };
                dynamicTocRows.push(currentMainChapter);
            }

            const h3Regex = /<h3 class="ssh"[^>]*>(.*?)<\/h3>/g;
            while ((match = h3Regex.exec(item.html)) !== null) {
                const titleText = match[1].replace(/<[^>]*>/g, '').trim();
                const dotCount = (titleText.match(/\./g) || []).length;
                if (dotCount >= 3 && titleText.startsWith('3.3.1.')) {
                    continue;
                }

                const childItem = {
                    title: titleText,
                    pg: String(pageNumVal)
                };

                if (currentMainChapter) {
                    currentMainChapter.children.push(childItem);
                } else {
                    dynamicTocRows.push(childItem);
                }
            }
        });
    });

    // Render chunks into body pages
    let bodyPages = '';
    pageChunks.forEach((chunkItems, chunkIdx) => {
        let chunkHtml = '';
        let inTable = false;
        let currentTableFindingIdx = -1;

        chunkItems.forEach(item => {
            if (item.type === 'general') {
                if (inTable) {
                    chunkHtml += `</tbody></table>`;
                    inTable = false;
                }
                chunkHtml += item.html;
            } else if (item.type === 'heading') {
                if (inTable) {
                    chunkHtml += `</tbody></table>`;
                    inTable = false;
                }
                chunkHtml += item.html;
            } else if (item.type === 'row') {
                if (!inTable || currentTableFindingIdx !== item.findingIdx) {
                    if (inTable) {
                        chunkHtml += `</tbody></table>`;
                    }
                    const tableMarginTop = inTable ? '10px' : '0px';
                    chunkHtml += `<table style="width:100%; border-collapse:collapse; font-family:'Arimo',Arial, sans-serif; font-size:9.5pt; border:1.5px solid #000; margin-bottom:1.5rem; background:#fff; margin-top:${tableMarginTop};"><tbody>`;
                    inTable = true;
                    currentTableFindingIdx = item.findingIdx;
                }
                chunkHtml += item.html;
            }
        });

        if (inTable) {
            chunkHtml += `</tbody></table>`;
        }

        bodyPages += mkPage(`page-body-${chunkIdx+1}`, chunkHtml, false);
    });

    // Reset pageNum and compile the dynamic TOC HTML
    pageNum = tpl ? ((tpl.start_page_num !== undefined && tpl.start_page_num !== null) ? parseInt(tpl.start_page_num) : 2) - 2 : 0;
    
    // Page 1: Cover
    pageNum++;
    
    // Page 2: Pratinjau
    const finalPratinjauHtml = mkPage('page-pratinjau', revContent);
    
    // Page 3: Dynamic TOC
    let dynamicTocHtml = '';
    if (hasToc) {
        let tocContentHtml = `<h2 class="sh-blue">${tr("DAFTAR ISI")}</h2><div class="toc">`;
        tocContentHtml += `<div class="toc-row toc-main"><span class="toc-t">${tr("DAFTAR ISI")}</span><span class="toc-dots"></span><span class="toc-p">ii</span></div>`;
        tocContentHtml += `<div class="toc-row toc-main"><span class="toc-t">${tr("PRATINJAU")}</span><span class="toc-dots"></span><span class="toc-p">iii</span></div>`;
        
        dynamicTocRows.forEach(row => {
            tocContentHtml += `<div class="toc-row toc-main"><span class="toc-t">${row.title}</span><span class="toc-dots"></span><span class="toc-p">${row.pg}</span></div>`;
            if (row.children) {
                row.children.forEach(c => {
                    tocContentHtml += `<div class="toc-row toc-child"><span class="toc-t">&nbsp;&nbsp;&nbsp;&nbsp;${c.title}</span><span class="toc-dots"></span><span class="toc-p">${c.pg}</span></div>`;
                });
            }
        });
        tocContentHtml += `</div>`;
        dynamicTocHtml = mkPage('page-toc', tocContentHtml);
    }
    
    // Combine everything in order
    pages = coverHtml + finalPratinjauHtml + dynamicTocHtml + bodyPages;



    // ══ FINAL HTML DOCUMENT ══════════════════════════════════════
    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview: ${p.name} — Vulnerability Assessment Report</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Arimo',Arial,sans-serif;font-size:10.5pt;background:#c8cdd6;color:#0f172a;min-height:100vh;line-height:1.5;}

/* ── Toolbar ── */
.ptbar{position:fixed;top:0;left:0;right:0;height:48px;background:#1e3a5f;display:flex;align-items:center;padding:0 1.25rem;gap:0.6rem;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.5);}
.ptbar-brand{font-size:0.9rem;font-weight:900;color:#60a5fa;letter-spacing:-0.01em;}
.ptbar-brand span{color:#f97316;}
.ptbar-proj{font-size:0.78rem;color:#94a3b8;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ptbtn{display:inline-flex;align-items:center;gap:0.3rem;padding:0.35rem 0.9rem;border:none;border-radius:4px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s;}
.ptbtn-print{background:#dc2626;color:#fff;}.ptbtn-print:hover{background:#b91c1c;}
.ptbtn-close{background:#374151;color:#e5e7eb;}.ptbtn-close:hover{background:#4b5563;}
.dw{margin-top:64px;padding:12px 0 48px;}

/* ── A4 Page ── */
.page{width:210mm;height:297mm;margin:0 auto 12px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.page-watermark::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    background-image: var(--watermark-img);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    opacity: 0.1;
    z-index: 0;
    pointer-events: none;
}
.page-watermark > * {
    position: relative;
    z-index: 1;
}

/* ── Page Header (non-cover) ── */
.page-header{display:flex;justify-content:space-between;align-items:center;padding:6px 18mm;border-bottom:3px solid #1e3a5f;min-height:16mm;flex-shrink:0;background:#fff;margin-top:30px;}
.header-main{}
.header-title{font-size:7.5pt;font-weight:800;color:#1e3a5f;text-transform:uppercase;letter-spacing:.04em;line-height:1.3;}
.header-subtitle{font-size:7pt;color:#64748b;font-weight:600;margin-top:1px;}
.header-right{}
.header-page{display:flex;align-items:center;gap:0.35rem;font-size:7.5pt;}
.hdr-label{color:#64748b;}
.hdr-sep{color:#94a3b8;}
.hdr-pg{color:#1e3a5f;font-weight:700;}

/* ── Page Content ── */
.page-content{flex:1;padding:9mm 18mm;overflow:hidden;}

/* ── Page Footer ── */
.page-footer{display:flex;justify-content:space-between;align-items:center;padding:5px 18mm;border-top:none;min-height:12mm;flex-shrink:0;font-size:7pt;color:#64748b;background:#f8fafc;margin-top:auto;margin-bottom:30px;}
.footer-l{flex:1;}
.footer-c{text-align:center;}
.footer-r{text-align:right;}
.cls-tag{font-size:10pt;font-weight:900;letter-spacing:.1em;text-transform:uppercase;border:1.5px solid;padding:3px 12px;border-radius:2px;}

/* ── Cover Page ── */
.cover-accent-bar{height:12px;background:linear-gradient(90deg,#1e3a5f 0%,#2563eb 50%,#dc2626 100%);flex-shrink:0;}
.cover-content{flex:1;}
.cover-inner{padding:10mm 20mm;display:flex;flex-direction:column;height:100%;}
.cover-logo-row{display:flex;align-items:center;gap:1.5rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0;margin-bottom:1.2rem;}
.cover-logo-text{font-size:3.5rem;font-weight:900;color:#1e3a5f;letter-spacing:-.03em;line-height:1;}
.cover-logo-text span{color:#dc2626;}
.cover-divider{height:3px;background:linear-gradient(90deg,#1e3a5f,#2563eb,#dc2626);margin-bottom:2rem;}
.cover-title-block{text-align:center;margin-bottom:2rem;}
.cover-label{font-size:1.2rem;font-weight:900;color:#1e3a5f;text-transform:uppercase;letter-spacing:.08em;line-height:1.3;}
.cover-and{font-size:1.4rem;font-weight:900;color:#dc2626;margin:.2rem 0;}
.cover-client{font-size:1.4rem;font-weight:900;color:#1e3a5f;margin-top:1.5rem;border-top:2px solid #e2e8f0;padding-top:0.75rem;}
.cover-project{font-size:1.1rem;font-weight:600;color:#475569;margin-top:.4rem;}
.cover-meta-grid{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1.5rem;width:fit-content;min-width:320px;align-self:center;}
.cover-meta-row{display:flex;gap:1rem;margin-bottom:.35rem;font-size:9pt;}
.cm-label{font-weight:700;color:#475569;min-width:180px;}
.cm-val{color:#0f172a;}
.cover-conf-box{border:2px solid #dc2626;color:#dc2626;font-size:1.1rem;font-weight:900;letter-spacing:.2em;text-align:center;padding:.5rem 2rem;display:inline-block;align-self:center;margin-bottom:1rem;}
.cover-notice{font-size:7.5pt;color:#94a3b8;text-align:center;padding-top:.75rem;border-top:1px solid #f1f5f9;margin-top:auto;}
.cover-footer-bar{background:#1e3a5f;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:6px 18mm;font-size:7.5pt;flex-shrink:0;}

:root { --spacing-mult: ${spacingMult}; }
/* ── Section headings ── */
.sh-blue{font-size:14pt;font-weight:900;color:#1e3a5f;border-bottom:2.5px solid #1e3a5f;padding-bottom:5px;margin-top:calc(25px * var(--spacing-mult));margin-bottom:calc(15px * var(--spacing-mult));text-transform:uppercase;letter-spacing:.02em;}
.ssh{font-size:10.5pt;font-weight:800;color:#1e293b;margin-top:calc(20px * var(--spacing-mult));margin-bottom:calc(12px * var(--spacing-mult));padding:.3rem .6rem;border-left:4px solid #1e3a5f;background:#f0f4fa;}
.sssh{font-size:10pt;font-weight:700;color:#334155;margin-top:calc(10px * var(--spacing-mult));margin-bottom:calc(5px * var(--spacing-mult));padding-left:.5rem;border-left:3px solid #94a3b8;}

/* ── Text / Content ── */
.tb{font-size:9.5pt;line-height:calc(1.1 * var(--spacing-mult));color:#1e293b;}
.tb p,.page-content>p{margin-bottom:calc(8px * var(--spacing-mult));}
.tb ul,.tb ol{padding-left:1.4rem;margin:calc(8px * var(--spacing-mult)) 0;}
.tb li{margin-bottom:calc(4px * var(--spacing-mult));}
.tb h1{font-size:12pt;font-weight:800;border-bottom:2px solid #e2e8f0;padding-bottom:3px;margin:.8rem 0 .4rem;}
.tb h2{font-size:10.5pt;font-weight:700;border-left:4px solid #1e3a5f;padding-left:.5rem;margin:.7rem 0 .35rem;background:#f0f4fa;padding:.25rem .5rem;}
.tb h3{font-size:10pt;font-weight:700;border-left:3px solid #94a3b8;padding-left:.5rem;margin:.6rem 0 .3rem;}
.tb blockquote{border-left:4px solid #1e3a5f;padding:.45rem .85rem;background:#f0f4fa;color:#475569;margin:.6rem 0;font-style:italic;}
.tb code,.tb pre{font-family:'Courier New',monospace;font-size:8pt;background:#f1f5f9;padding:1px 4px;border-radius:3px;}
.tb pre{display:block;padding:.45rem .7rem;margin:.45rem 0;overflow-x:auto;}
.tb img{max-width:100%;height:auto;border-radius:4px;margin:.45rem 0;display:block;}
.tb table{width:100%;border-collapse:collapse;margin:calc(12px * var(--spacing-mult)) 0;font-size:9pt;}
.tb table th{background:#1e3a5f;color:#fff;padding:calc(6px * var(--spacing-mult)) 9px;text-align:left;font-weight:700;font-size:8.5pt;border:1px solid #1e3a5f;}
.tb table td{padding:calc(5.5px * var(--spacing-mult)) 9px;border:1px solid #e2e8f0;vertical-align:top;}
.tb table tr:first-child td, .tb table tr:first-child th{background:#1e3a5f !important;color:#fff !important;font-weight:700;font-size:8.5pt;border:1px solid #1e3a5f;}
.tb table tr:nth-child(even) td{background:#f8fafc;}

/* ── Tables ── */
.tbl{width:100%;border-collapse:collapse;margin:calc(12px * var(--spacing-mult)) 0;font-size:9pt;}
.tbl th{background:#1e3a5f;color:#fff;padding:calc(6px * var(--spacing-mult)) 9px;text-align:left;font-weight:700;font-size:8.5pt;border:1px solid #1e3a5f;}
.tbl td{padding:calc(5.5px * var(--spacing-mult)) 9px;border:1px solid #e2e8f0;vertical-align:top;}
.tbl tr:nth-child(even) td{background:#f8fafc;}
.lc{font-weight:700;color:#1e3a5f;background:#f0f4fa !important;border-right:1px solid #e2e8f0;}
code{font-family:'Courier New',monospace;font-size:7.8pt;background:#f1f5f9;padding:1px 4px;border-radius:3px;word-break:break-all;}

/* Severity badge */
.svb{display:inline-block;padding:2px 9px;border-radius:100px;font-size:7.5pt;font-weight:900;letter-spacing:.04em;text-transform:uppercase;}

/* TOC */
.toc{margin-top:.75rem;}
.toc-row{display:flex;align-items:flex-end;gap:.25rem;margin-bottom:.7rem;padding-bottom:.3rem;}
.toc-main .toc-t{font-size:10pt;font-weight:700;color:#1e3a5f;}
.toc-child .toc-t{font-size:9.5pt;font-weight:500;color:#334155;}
.toc-dots{flex:1;border-bottom:1px dotted #94a3b8;margin-bottom:3px;}
.toc-p{font-size:9pt;font-weight:800;color:#1e3a5f;}

/* Methodology flow */
.methodology-flow{display:flex;align-items:center;gap:4px;margin:1.2rem 0;flex-wrap:nowrap;}
.mf-step{background:#3b82f6;color:#fff;font-size:8pt;font-weight:800;padding:8px 12px;border-radius:3px;text-align:center;min-width:70px;}
.mf-arrow{color:#94a3b8;font-size:1rem;font-weight:700;}

/* Overall risk */
.risk-overall{display:inline-block;border:2px solid;padding:4px 16px;font-size:10pt;font-weight:900;letter-spacing:.06em;margin-top:.75rem;border-radius:3px;}

/* Finding detail */
.finding-meta-tbl{margin-bottom:1rem;}
.finding-meta-tbl td{font-size:9pt;}

@page {
    size: A4 portrait;
    margin: 0;
}
/* Print */
@media print{
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    body{background:#fff;}
    .ptbar{display:none !important;}
    #print-auth-modal{display:none !important;}
    .dw{margin-top:0;padding:0;zoom:1 !important;}
    
    .page {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        page-break-after: always !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        position: relative !important;
        background: #fff !important;
    }
    .page-content {
        flex: 1 !important;
        overflow: hidden !important;
        height: auto !important;
        padding: 9mm 18mm !important;
    }
    
    .print-only-thead {
        display: none !important;
    }
    .print-only-tfoot {
        display: none !important;
    }
    .page-print-table {
        width: 100% !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
    }
    .page-print-table > tbody,
    .page-print-table > tbody > tr,
    .page-print-table > tbody > tr > td {
        display: flex !important;
        flex-direction: column !important;
        flex: 1 !important;
        width: 100% !important;
    }
    
    tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
    h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        break-after: avoid !important;
    }
    


    .page-header {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        margin-top: 30px !important;
        height: auto !important;
        padding: 6px 18mm !important;
        background: #fff !important;
        z-index: auto !important;
        display: flex !important;
    }
    .page-footer {
        position: relative !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        margin-bottom: 30px !important;
        height: auto !important;
        padding: 5px 18mm !important;
        background: #fff !important;
        z-index: auto !important;
        border-top: none !important;
        display: flex !important;
    }
}
</style>
</head>
<body>

<div class="ptbar">
    <div class="ptbar-brand">i<span>3</span> &nbsp;PentaGO</div>
    <div class="ptbar-proj">VA&PT Report Preview: ${p.name} | ${companyName}</div>
    
    <div style="display:flex;align-items:center;gap:0.4rem;margin-right:1rem;background:rgba(255,255,255,0.1);padding:0.25rem 0.5rem;border-radius:4px;user-select:none;">
        <button class="ptbtn" onclick="changeZoom(-0.1)" style="padding:0.25rem 0.5rem;background:#374151;color:#fff;min-width:28px;height:24px;border:none;cursor:pointer;border-radius:3px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;">-</button>
        <span id="zoom-label" style="font-size:0.78rem;font-weight:bold;color:#fff;min-width:40px;text-align:center;">100%</span>
        <button class="ptbtn" onclick="changeZoom(0.1)" style="padding:0.25rem 0.5rem;background:#374151;color:#fff;min-width:28px;height:24px;border:none;cursor:pointer;border-radius:3px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;">+</button>
    </div>

    <button class="ptbtn ptbtn-print" onclick="window.print()" style="background:#64748b;">&#128424;&#65039; Print (No Password)</button>
    <button class="ptbtn ptbtn-print" onclick="requestSecurePdf()" style="background:#2563eb;">&#128274; Download Secure PDF</button>
    <button class="ptbtn ptbtn-close" onclick="window.close()">&#x2715; ${lang === 'en' ? 'Close' : 'Tutup'}</button>
</div>

<div class="dw">
${pages}
</div>

<div id="print-auth-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;font-family:sans-serif;">
    <div style="background:#fff;padding:2rem;border-radius:8px;width:350px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <h3 style="margin:0 0 1rem 0;color:#1e3a5f;font-size:1.1rem;">Generate Secure PDF</h3>
        <p style="font-size:0.85rem;color:#64748b;margin-bottom:1rem;">Silakan masukkan password untuk mengenkripsi PDF ini.</p>
        <input type="password" id="print-pwd-input" style="width:100%;padding:0.6rem;border:1px solid #cbd5e1;border-radius:4px;margin-bottom:1rem;font-size:0.9rem;" placeholder="Password..." />
        
        <div id="print-pwd-loading" style="display:none;margin-bottom:1rem;">
            <div style="font-size:0.85rem;color:#1e3a5f;margin-bottom:0.5rem;font-weight:600;text-align:left;">Sedang membuat PDF... <span id="pdf-progress-text" style="float:right;">0%</span></div>
            <div style="width:100%;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:0.5rem;">
                <div id="pdf-progress-bar" style="width:0%;height:100%;background:#2563eb;transition:width 0.5s ease;"></div>
            </div>
            <div style="font-size:0.75rem;color:#64748b;text-align:left;">Ini bisa memakan waktu hingga 30 detik.</div>
        </div>
        
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;" id="print-pwd-actions">
            <button onclick="closePrintAuth()" style="padding:0.5rem 1rem;border:none;background:#f1f5f9;color:#475569;border-radius:4px;cursor:pointer;font-weight:600;">Batal</button>
            <button onclick="submitSecurePdf()" style="padding:0.5rem 1rem;border:none;background:#2563eb;color:#fff;border-radius:4px;cursor:pointer;font-weight:600;">Lanjutkan</button>
        </div>
    </div>
</div>

<style>
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>

<script>
function requestSecurePdf() {
    document.getElementById('print-pwd-input').value = '';
    document.getElementById('print-auth-modal').style.display = 'flex';
    document.getElementById('print-pwd-loading').style.display = 'none';
    document.getElementById('print-pwd-actions').style.display = 'flex';
    document.getElementById('print-pwd-input').focus();
}

function closePrintAuth() {
    document.getElementById('print-auth-modal').style.display = 'none';
}

function submitSecurePdf() {
    const pwd = document.getElementById('print-pwd-input').value;
    if (!pwd) {
        alert("Password wajib diisi untuk mengenkripsi PDF.");
        return;
    }
    
    document.getElementById('print-pwd-loading').style.display = 'block';
    document.getElementById('print-pwd-actions').style.display = 'none';
    
    // Fake progress animation
    const pBar = document.getElementById('pdf-progress-bar');
    const pText = document.getElementById('pdf-progress-text');
    let progress = 0;
    pBar.style.width = '0%';
    pText.textContent = '0%';
    
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += Math.floor(Math.random() * 8) + 2;
            if (progress > 90) progress = 90;
            pBar.style.width = progress + '%';
            pText.textContent = progress + '%';
        }
    }, 1200);
    
    // Get full HTML (cloning to remove UI elements)
    const clone = document.documentElement.cloneNode(true);
    const authModal = clone.querySelector('#print-auth-modal');
    if (authModal) authModal.remove();
    
    const htmlContent = "<!DOCTYPE html>\\n<html>\\n" + clone.innerHTML + "\\n</html>";
    
    fetch('/api/export_secure_pdf/${p.id}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            html_content: htmlContent,
            password: pwd
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Server error'); });
        }
        return response.blob();
    })
    .then(blob => {
        clearInterval(interval);
        pBar.style.width = '100%';
        pText.textContent = '100%';
        
        setTimeout(() => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = "Pentago_Report_${p.name.replace(/\s+/g, '_')}.pdf";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            closePrintAuth();
        }, 500);
    })
    .catch(err => {
        clearInterval(interval);
        alert("Gagal membuat PDF aman: " + err.message);
        closePrintAuth();
        window.URL.revokeObjectURL(url);
        closePrintAuth();
    })
    .catch(err => {
        alert("Gagal membuat PDF aman: " + err.message);
        closePrintAuth();
    });
}

document.getElementById('print-pwd-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitSecurePdf();
});

let currentZoom = 1.0;
function changeZoom(delta) {
    currentZoom = Math.min(2.0, Math.max(0.5, currentZoom + delta));
    const dw = document.querySelector('.dw');
    if (dw) {
        dw.style.zoom = currentZoom;
    }
    const label = document.getElementById('zoom-label');
    if (label) {
        label.textContent = Math.round(currentZoom * 100) + '%';
    }
}
</script>
</body>
</html>`;
}

function _estimateTotalPages(structure, findings) {
    let count = 4;
    if (findings) count += findings.length * 2;
    if (structure) {
        structure.forEach(s => {
            if (s.enabled !== false) {
                count += 1;
                if (s.subsections) count += s.subsections.length;
            }
        });
    }
    return count;
}
