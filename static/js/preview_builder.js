// ==========================================
// _buildPreviewDocument  —  A4 Report Preview Builder
// Format mirip i3/PLN EPI: VAPT Report Template
// ==========================================

function _buildPreviewDocument(p, findings, tpl, structure, lang = 'id', isDocx = false, spacingMult = 1.4) {
    const classification = tpl ? (tpl.classification || 'CONFIDENTIAL') : 'CONFIDENTIAL';
    const footerText     = p.footer_text || (tpl ? (tpl.footer_text || 'Document Control') : 'Document Control');
    const companyName    = p.company_name || p.name || '-';
    const todayStr = lang === 'en'
        ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr  = new Date().getFullYear();

    let workspaceDocs = {};
    let captionCounter = 1;
    try {
        if (p.technical_report) {
            const parsed = JSON.parse(p.technical_report);
            if (Array.isArray(parsed)) {
                parsed.forEach(sec => {
                    if (sec.id) {
                        if (sec.title) workspaceDocs[`title_${sec.id}`] = sec.title;
                        if (sec.content) workspaceDocs[sec.id] = sec.content;
                        workspaceDocs[`subs_${sec.id}`] = sec.subsections || [];
                    }
                    if (sec.subsections) {
                        sec.subsections.forEach(sub => {
                            workspaceDocs[sub.id] = sub.content || '';
                            if (sub.id && sub.title) workspaceDocs[`title_${sub.id}`] = sub.title;
                        });
                    }
                });
            } else if (parsed && Array.isArray(parsed.subsections)) {
                parsed.subsections.forEach(sub => {
                    workspaceDocs[sub.id] = sub.content || '';
                });
            }
        }
    } catch(e) {
        console.error("Error parsing technical_report in preview_builder:", e);
    }

    // Force dynamic generation for Findings Summary
    // delete workspaceDocs['sub-1-6']; // Removed: User wants manual edits to be preserved
    delete workspaceDocs['sub-1-7'];

    // Translation helper
    const tr = (text) => {
        if (!text) return '';
        if (lang !== 'en') return text;
        const clean = text.trim();
        
        // 1. Try exact dictionary lookup for speed and exact string match (if available)
        if (typeof ID_EN_DICTIONARY !== 'undefined' && ID_EN_DICTIONARY[clean]) {
            return ID_EN_DICTIONARY[clean];
        }

        // 2. Fallback to advanced translation function (regex replacement for HTML blocks)
        if (typeof window.localTranslateText === 'function') {
            return window.localTranslateText(text);
        }

        return text;
    };

    const b1 = p.header_text ? tr(p.header_text) : (tpl ? tpl.default_title : 'VULNERABILITY ASSESSMENT REPORT');
    const b2 = p.cover_title_2 ? tr(p.cover_title_2) : 'PENETRATION TESTING';
    const reportTitle = p.header_text && p.cover_title_2 ? `${b1} & ${b2}` : (p.header_text ? b1 : 'VULNERABILITY ASSESSMENT REPORT & PENETRATION TESTING');

    // Severity config
    const sevColor = { Critical:'#7c3aed', High:'#dc2626', Medium:'#d97706', Low:'#16a34a', Info:'#0284c7' };
    const sevBg    = { Critical:'#f5f3ff', High:'#fef2f2', Medium:'#fffbeb', Low:'#f0fdf4', Info:'#eff6ff' };
    const riskColor = { Critical:'#7c3aed', High:'#dc2626', Medium:'#d97706', Low:'#16a34a', None:'#64748b', Info:'#0284c7' };

    // Render content (Quill HTML or markdown)
    const renderContent = (txt, isDryRun = false) => {
        if (!txt || !txt.trim()) return '<p style="color:#94a3b8;font-style:italic;">-</p>';
        let t = txt.trim();

        if (lang === 'en' && typeof tr === 'function') {
            t = tr(t);
        }
        
        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(t, 'text/html');
                
                // Keep the Quill alignment classes intact so that the CSS rules can apply them
                // Apply auto-numbering for [caption: ...] even in rich text
                // Also enforce table styles for any tables from Quill
                const tables = doc.querySelectorAll('table');
                tables.forEach(table => {
                    if (!table.classList.contains('tbl')) table.classList.add('tbl');
                    const rows = Array.from(table.querySelectorAll('tr'));
                    let headerRow = null;
                    for (let r of rows) {
                        // Skip completely empty rows that Quill sometimes generates
                        if (r.textContent.trim().length > 0) {
                            headerRow = r;
                            break;
                        } else {
                            r.parentNode.removeChild(r);
                        }
                    }
                    
                    if (headerRow) {
                        const cells = headerRow.querySelectorAll('td, th');
                        cells.forEach(cell => {
                            // Convert back to TH for the preview so .tbl th CSS applies perfectly
                            const th = doc.createElement('th');
                            th.innerHTML = cell.innerHTML;
                            // Strip any inner inline styles for color/background-color from spans that Quill might have added
                            const spans = th.querySelectorAll('span');
                            spans.forEach(s => {
                                s.style.backgroundColor = '';
                                s.style.color = '';
                            });
                            cell.parentNode.replaceChild(th, cell);
                        });
                    }
                });

                let tempHtml = doc.body.innerHTML;
                tempHtml = tempHtml.replace(/\[caption:\s*(.+?)\]/gi, (match, captionText) => {
                    const counterValue = isDryRun ? 999 : (captionCounter++);
                    const prefix = (lang === 'en' ? 'Figure ' : 'Gambar ') + counterValue + '. ';
                    return `<div style="font-size:7.5pt; color:#64748b; margin-top:4px; margin-bottom:0.5rem; text-align:center; font-style:italic;">${prefix}${captionText}</div>`;
                });
                t = tempHtml;
            } catch (e) {}
        }

        
        
        
        

        const isHtml = (t.startsWith('<p') || t.startsWith('<h') || t.startsWith('<ul') || t.startsWith('<ol') ||
                        t.startsWith('<div') || t.startsWith('<strong') || t.startsWith('<em') ||
                        t.startsWith('<blockquote') || t.startsWith('<pre') || t.startsWith('<table') || t.startsWith('<span')) && t.includes('</');
        if (isHtml) {
            try { let res = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(t, { ADD_ATTR: ['class', 'style'] }) : t; return res; } catch(e) { return t; }
        }
        return _simMd(t, isDryRun);
    };

    const estimateHtmlHeight = (html) => {
        if (!html) return 0;
        const cleanText = html.replace(/<[^>]*>/g, '').trim();
        // Base text height estimation
        let h = Math.max(30, Math.ceil(cleanText.length / 80) * 30 * spacingMult);

        const h2Count = (html.match(/<h2/g) || []).length;
        const h3Count = (html.match(/<h3/g) || []).length;
        h += (h2Count * 60 + h3Count * 45) * spacingMult;

        // Increase tr base height to 30, and DO NOT multiply by spacingMult 
        // because the table padding and line-height are hardcoded in the HTML string!
        const trCount = (html.match(/<tr/g) || []).length;
        h += trCount * 45;

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

    const pushDynamicContent = (htmlStr, defaultType = 'general') => {
        if (!htmlStr) return;
        if (htmlStr.indexOf('<table') === -1) {
            flowItems.push({ type: defaultType, height: estimateHtmlHeight(htmlStr), html: htmlStr });
            return;
        }
        try {
            const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
            let currentGeneralHtml = '';
            Array.from(doc.body.childNodes).forEach(node => {
                if (node.nodeType === 1 && node.tagName.toLowerCase() === 'table') {
                    if (currentGeneralHtml.trim()) {
                        flowItems.push({ type: defaultType, height: estimateHtmlHeight(currentGeneralHtml), html: currentGeneralHtml });
                        currentGeneralHtml = '';
                    }
                    let theadHtml = '';
                    const thead = node.querySelector('thead');
                    if (thead) {
                        theadHtml = `<thead>${thead.innerHTML}</thead>`;
                    } else {
                        const firstRow = node.querySelector('tr');
                        if (firstRow && firstRow.querySelector('th')) {
                            theadHtml = `<thead>${firstRow.outerHTML}</thead>`;
                            firstRow.parentNode.removeChild(firstRow);
                        }
                    }
                    const rows = Array.from(node.querySelectorAll('tr'));
                    rows.forEach(r => {
                        if (r.parentNode && r.parentNode.tagName && r.parentNode.tagName.toLowerCase() === 'thead') return;
                        const rowHeight = Math.max(40, Math.ceil((r.textContent.length||50)/80)*20 + 20);
                        flowItems.push({
                            type: 'dynamic_table_row',
                            height: rowHeight,
                            html: r.outerHTML,
                            theadHtml: theadHtml,
                            tableClass: node.className || 'tbl'
                        });
                    });
                } else {
                    currentGeneralHtml += (node.nodeType === 1 ? node.outerHTML : node.textContent);
                }
            });
            if (currentGeneralHtml.trim()) {
                flowItems.push({ type: defaultType, height: estimateHtmlHeight(currentGeneralHtml), html: currentGeneralHtml });
            }
        } catch (e) {
            flowItems.push({ type: defaultType, height: estimateHtmlHeight(htmlStr), html: htmlStr });
        }
    };

    // Simple markdown → HTML
    const _simMd = (md, isDryRun = false) => {
        if (!md) return '';
        let h = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        
        // Headers
        h = h.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>');
        
        // Bold, italic, code
        h = h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
        h = h.replace(/`(.+?)`/g,'<code>$1</code>');
        
        // Images: ![alt](url) or ![alt | center](url)
        h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            let alignStyle = '';
            let imgStyle = 'max-width:100%; height:auto; border:1px solid #000;';
            if (alt.includes('center')) {
                alignStyle = 'text-align:center;';
            }
            let cleanAlt = alt.split('|')[0].trim();
            let captionHtml = '';
            if (cleanAlt && cleanAlt.toLowerCase() !== 'screenshot' && cleanAlt !== '') {
                const counterValue = isDryRun ? 999 : (captionCounter++);
                const prefix = (lang === 'en' ? 'Figure ' : 'Gambar ') + counterValue + '. ';
                captionHtml = `<div style="font-size:7.5pt; color:#64748b; margin-top:4px; text-align:center; font-style:italic;">${prefix}${cleanAlt}</div>`;
            }
            return `<div style="margin:0.5rem 0; ${alignStyle}"><img src="${url}" alt="${cleanAlt}" style="${imgStyle}">${captionHtml}</div>`;
        });
        
        // Standalone caption: [caption: Keterangan]
        h = h.replace(/\[caption:\s*(.+?)\]/gi, (match, captionText) => {
            const counterValue = isDryRun ? 999 : (captionCounter++);
            const prefix = (lang === 'en' ? 'Figure ' : 'Gambar ') + counterValue + '. ';
            return `<div style="font-size:7.5pt; color:#64748b; margin-top:4px; margin-bottom:0.5rem; text-align:center; font-style:italic;">${prefix}${captionText}</div>`;
        });
        
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
    const headerLogoSrc = p.cover_logo || (tpl ? tpl.auditor_logo : null);
    const coverLogoSrc = p.main_cover_logo || (tpl ? tpl.auditor_logo : null);
    
    // Always apply watermark if a logo is available
    const watermarkCss = headerLogoSrc ? `style="--watermark-img: url('${headerLogoSrc}');"` : '';
    const pageClass = headerLogoSrc ? 'page page-watermark' : 'page';

    // ── Standard header for all pages (except cover) ──────────────
    const mkHeader = (pageTitle) => {
        const hasClientLogo = clientLogoSrc && (!tpl || tpl.show_client_logo !== 0);
        const hasAuditorLogo = headerLogoSrc && (!tpl || tpl.show_auditor_logo !== 0);
        const align = tpl ? tpl.header_alignment : 'center';

        if (align === 'left') {
            const auditorLogoImg = hasAuditorLogo ? `<img src="${headerLogoSrc}" style="height:31px;max-width:91px;object-fit:contain;margin-right:12px;">` : '';
            return `
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1e3a5f;padding:6px 18mm;min-height:16mm;background:#fff;margin-top:30px;">
            <div class="header-main" style="display:flex;align-items:center;">
                ${auditorLogoImg}
                <div>
                    <div class="header-title">${reportTitle}</div>
                    <div class="header-subtitle">${companyName}</div>
                </div>
            </div>
            <div class="header-right" style="display:flex;align-items:center;">
                ${hasClientLogo ? `<img src="${clientLogoSrc}" style="height:31px;max-width:91px;object-fit:contain;margin-right:12px;mix-blend-mode:multiply;">` : ''}
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
        <!-- Left: Auditor Logo -->
        <div style="width:15%;display:flex;align-items:center;justify-content:flex-start;">
            ${hasAuditorLogo ? `<img src="${headerLogoSrc}" style="max-height:62px;max-width:100%;object-fit:contain;">` : ''}
        </div>
        
        <!-- Center: Bordered Header Box -->
        <div style="width:70%;display:flex;flex-direction:column;align-items:center;">
            <table style="width:80%;border-collapse:collapse;border:1px solid #000;font-family:'Arimo',Arial,sans-serif;font-size:7.5pt;text-align:center;line-height:1.3;">
                <tr>
                    <td style="border:1px solid #000;padding:6px;font-weight:bold;text-transform:uppercase;color:#333;">
                        ${reportTitle}<br>
                        ${companyName}<br>
                        ${p.name}
                    </td>
                </tr>
                <tr>
                    <td style="border:1px solid #000;padding:3px 8px;font-size:7pt;color:#666;font-weight:bold;">
                        <table style="width:100%;border:none;border-collapse:collapse;margin:0;padding:0;background:transparent;">
                            <tr>
                                <td style="text-align:left;border:none;padding:0;font-size:7pt;color:#666;font-weight:bold;text-transform:uppercase;">${pageTitle || ''}</td>
                                <td style="text-align:right;border:none;padding:0;font-size:7pt;color:#666;font-weight:bold;">Page ${pageNum}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Right: Client Logo -->
        <div style="width:15%;display:flex;align-items:center;justify-content:flex-end;">
            ${hasClientLogo ? `<img src="${clientLogoSrc}" style="max-height:62px;max-width:100%;object-fit:contain;mix-blend-mode:multiply;">` : ''}
        </div>
    </div>`;
    };

    const mkFooter = () => `
    <div class="page-footer" style="display:flex;justify-content:center;align-items:center;min-height:12mm;flex-shrink:0;background:#f8fafc;border-top:none;margin-top:auto;margin-bottom:30px;">
        <span class="cls-tag" style="border-color:#dc2626;color:#dc2626;font-size:11.25pt;font-weight:900;letter-spacing:.1em;text-transform:uppercase;border:1.5px solid;padding:3px 15px;border-radius:2px;display:inline-block;">${classification}</span>
    </div>`;

    const mkPage = (id, content, noHeader = false, pageTitle = '') => {
        pageNum++;
        if (isDocx) {
            const hasClientLogo = clientLogoSrc && (!tpl || tpl.show_client_logo !== 0);
            const clientLogoHtml = hasClientLogo ? `<img src="${clientLogoSrc}" height="35" style="height:35px; width:auto;mix-blend-mode:multiply;">` : '';
            const hasAuditorLogo = headerLogoSrc && (!tpl || tpl.show_auditor_logo !== 0);
            const auditorLogoHtml = hasAuditorLogo ? `<img src="${headerLogoSrc}" height="35" style="height:35px; width:auto;">` : '';
            
            const centerTableHtml = `
                <table style="width:80%;margin:0 auto;border-collapse:collapse;border:1px solid #000;font-family:'Arimo',Arial,sans-serif;font-size:7.5pt;text-align:center;line-height:1.3;">
                    <tr>
                        <td style="border:1px solid #000;padding:6px;font-weight:bold;text-transform:uppercase;color:#333;">
                            ${reportTitle}<br>
                            ${companyName}<br>
                            ${p.name}
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #000;padding:3px 8px;font-size:7pt;color:#666;font-weight:bold;">
                            <table style="width:100%;border:none;border-collapse:collapse;margin:0;padding:0;background:transparent;">
                                <tr>
                                    <td style="text-align:left;border:none;padding:0;font-size:7pt;color:#666;font-weight:bold;text-transform:uppercase;">${pageTitle || ''}</td>
                                    <td style="text-align:right;border:none;padding:0;font-size:7pt;color:#666;font-weight:bold;">Page ${pageNum}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `;

            const headerHtml = noHeader ? '' : `
                <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:10px;">
                    <tr>
                        <td style="width:15%; vertical-align:middle; text-align:left;">
                            ${auditorLogoHtml}
                        </td>
                        <td style="width:70%; vertical-align:middle; text-align:center;">
                            ${centerTableHtml}
                        </td>
                        <td style="width:15%; vertical-align:middle; text-align:right;">
                            ${clientLogoHtml}
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
        ${noHeader ? '' : mkHeader(pageTitle)}
        
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
    const reportDateStr = p.report_date ? tr(p.report_date) : todayStr;
    const reportVer = p.report_version || '1.0.0';
    const reportAuthorName = p.report_author || p.pentest_consultant_name || 'Pentest Team';
    let coverHtml = '';
    if (isDocx) {
        coverHtml = `
    <div class="${pageClass}" id="page-cover" style="padding-left:18mm; padding-right:18mm; background:#ffffff;" ${watermarkCss}>
        <table style="width:100%; border:none; border-collapse:collapse; margin-top:20px;">
            <tr>
                <td align="center" style="padding-bottom: 25px; padding-left:18mm; padding-right:18mm;">
                    ${coverLogoSrc ? `<img src="${coverLogoSrc}" height="104" style="height:104px; width:auto;">` : `<div style="font-size:4.55rem;font-weight:900;color:#1e3a5f;text-align:center;">i3</div>`}
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-bottom: 25px; padding-left:18mm; padding-right:18mm;">
                    <div style="text-align:center;margin-top:2.5rem;margin-bottom:1rem;">
                        <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;text-transform:uppercase;">${p.header_text ? tr(p.header_text) : 'VULNERABILITY ASSESSMENT REPORT'}</div>
                        <div style="font-size:19pt;font-weight:700;color:#dc2626;margin:0.25rem 0;">&amp;</div>
                        <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;margin-bottom:1.2rem;text-transform:uppercase;">${p.cover_title_2 ? tr(p.cover_title_2) : 'PENETRATION TESTING'}</div>
                        <div style="font-size:17.5pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;margin-bottom:0.5rem;">${companyName}</div>
                        <div style="font-size:17.5pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;">${p.name}</div>
                    </div>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-bottom: 25px; padding-left:18mm; padding-right:18mm;">
                    <div style="font-size:10.5pt; margin-bottom:10px;">${lang === 'en' ? 'Work Order (SPK)' : 'Surat Perintah Kerja (SPK)'} : <strong>${spk}</strong></div>
                    ${clientLogoSrc ? `<div style="margin-bottom:12px;"><img src="${clientLogoSrc}" height="70" style="height:70px; width:auto;mix-blend-mode:multiply;"></div>` : ''}
                    <div style="text-align:center;font-size:11pt;color:#000;line-height:1.6;font-weight:800;margin-top:0.25rem;">
                        <div>${reportDateStr}</div>
                        <div>${tr("Versi")}: ${reportVer}</div>
                        <div>${tr("Penulis")}: ${reportAuthorName}</div>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 25px; font-size:7.5pt; color:#475569; padding-left:18mm; padding-right:18mm;">
                    <div style="border-top:2px solid #dc2626; padding-top:10px; text-align:center; line-height:1.5;">
                        <strong style="color:#000;">PT. INOVASI INFORMATIKA INDONESIA</strong><br>
                        Millennium Centennial Center 38th Floor - Jl. Jenderal Sudirman Kav. 25<br>
                        South Jakarta - Indonesia 12920<br>
                        Phone: 021 290 233 93 | Email: info@i-3.co.id
                    </div>
                    <div style="margin-top:12px; text-align:center;">
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
                    ${coverLogoSrc ? `<img src="${coverLogoSrc}" style="height:117px;object-fit:contain;">` : `<div class="cover-logo-text" style="font-size:7.15rem;font-weight:900;color:#1e3a5f;letter-spacing:-.03em;line-height:1;text-align:center;">i<span>3</span></div>`}
                </div>

                <!-- Title Block -->
                <div class="cover-title-block" style="text-align:center;margin-top:1.5rem;margin-bottom:0.5rem;">
                    <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;text-transform:uppercase;">${p.header_text ? tr(p.header_text) : tr('VULNERABILITY ASSESSMENT REPORT')}</div>
                    <div style="font-size:19pt;font-weight:700;color:#dc2626;margin:0.1rem 0;">&amp;</div>
                    <div style="font-size:19pt;font-weight:700;color:#000;letter-spacing:0.02em;line-height:1.4;margin-bottom:0.5rem;text-transform:uppercase;">${p.cover_title_2 ? tr(p.cover_title_2) : tr('PENETRATION TESTING')}</div>
                    <div style="font-size:17.5pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;margin-bottom:0.25rem;margin-top:0.5rem;">${companyName}</div>
                    <div style="font-size:17.5pt;font-weight:700;color:#000;letter-spacing:0.01em;line-height:1.3;text-transform:uppercase;">${p.name}</div>
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
                        <div>${tr("Versi")}: ${reportVer}</div>
                        <div>${tr("Penulis")}: ${reportAuthorName}</div>
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
            <td style="border: 1px solid #000; padding: 18px 10px 48px 10px; text-align: center; vertical-align: middle;">${app.name || '-'}</td>
            <td style="border: 1px solid #000; padding: 18px 10px 48px 10px; text-align: center; vertical-align: middle;">${app.company || '-'}</td>
            <td style="border: 1px solid #000; padding: 18px 10px 48px 10px; text-align: center; vertical-align: middle;">${app.approved || '&nbsp;'}</td>
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
    const hasToc = true;

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

    const defaultIntro = lang === 'en'
        ? `PT. Inovasi Informatika Indonesia (I-3) as a third party conducted a security audit for the application owned by <strong>${companyName}</strong>, held on ${todayStr} through penetration testing. The purpose of this testing is to identify vulnerabilities that could be exploited by attackers.`
        : `PT. Inovasi Informatika Indonesia (I-3) sebagai pihak ketiga melakukan audit keamanan untuk aplikasi milik <strong>${companyName}</strong>, yang diselenggarakan pada ${todayStr} melalui pengujian penetrasi. Tujuan dari pengujian ini adalah untuk mengidentifikasi kerentanan yang dapat dimanfaatkan oleh penyerang.`;

    const flowItems = [];

    let scopeHtml = '<code>-</code>';
    if (p.scope) {
        let scopes = p.scope.split(/,|\n/).map(s => s.trim()).filter(s => s);
        if (scopes.length > 1) {
            scopeHtml = '<ul style="margin: 0; padding-left: 20px; text-align: left;">' + scopes.map(s => `<li><code>${s}</code></li>`).join('') + '</ul>';
        } else if (scopes.length === 1) {
            scopeHtml = `<code>${scopes[0]}</code>`;
        }
    }

    // --- BAB 1 ---
    const pushGeneralItem = (htmlStr) => {
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(htmlStr),
            html: htmlStr
        });
    };

    // --- BAB 1 ---
    pushGeneralItem(`
    <h2 class="sh-blue">${tr(workspaceDocs['title_sec-1'] || "1. RINGKASAN EKSEKUTIF")}</h2>
    <h3 class="ssh">${tr(workspaceDocs['title_sub-1-0'] || "1.0. Kesimpulan (Project Summary)")}</h3>
    <div class="tb">
        ${workspaceDocs['sub-1-0'] !== undefined ? renderContent(workspaceDocs['sub-1-0']) : (p.summary ? renderContent(p.summary) : `<p>${defaultIntro}</p>`)}
    </div>
    `);

    pushGeneralItem(`
    <h3 class="ssh">${tr(workspaceDocs['title_sub-1-1'] || "1.1. Latar Belakang")}</h3>
    <div class="tb">${workspaceDocs['sub-1-1'] !== undefined ? renderContent(workspaceDocs['sub-1-1']) : (renderContent(bgText) || renderContent(p.description))}</div>
    `);

    pushGeneralItem(`
    <h3 class="ssh">${tr(workspaceDocs['title_sub-1-2'] || "1.2. Ruang Lingkup")}</h3>
    ${workspaceDocs['sub-1-2'] !== undefined ? renderContent(workspaceDocs['sub-1-2']) : `
    <table class="tbl">
        <thead><tr><th>${tr("No.")}</th><th>${lang === 'en' ? 'Device / Application' : 'Perangkat / Aplikasi'}</th><th>URL/IP</th><th>Detail</th><th>${lang === 'en' ? 'Methodology' : 'Metodologi'}</th></tr></thead>
        <tbody>
            <tr>
                <td style="text-align:center;">1</td>
                <td>${p.name || 'Aplikasi'}</td>
                <td>${scopeHtml}</td>
                <td>${lang === 'en' ? 'Web Application' : 'Aplikasi Web'}</td>
                <td>${p.methodology || 'Black box'}</td>
            </tr>
        </tbody>
    </table>`}
    `);

    pushGeneralItem(`
    <h3 class="ssh">${tr(workspaceDocs['title_sub-1-3'] || "1.3. Skenario Penetration Testing")}</h3>
    <div class="tb">${workspaceDocs['sub-1-3'] !== undefined ? renderContent(workspaceDocs['sub-1-3']) : renderContent(p.access_info || (lang === 'en' ? 'Pentester performs scanning related to OS, port, and open vulnerabilities as an internet user, application user, and also as an admin.' : 'Pentester melakukan scanning terkait informasi OS, port, dan celah yang terbuka sebagai pengguna internet, pengguna aplikasi, juga sebagai admin aplikasi.'))}</div>
    `);

    pushGeneralItem(`
    <h3 class="ssh">${tr(workspaceDocs['title_sub-1-4'] || "1.4. Batasan Pekerjaan")}</h3>
    <div class="tb">${workspaceDocs['sub-1-4'] !== undefined ? renderContent(workspaceDocs['sub-1-4']) : renderContent(p.out_of_scope || (lang === 'en' ? 'Delivery of services described in the scope of work does not cover the following:\n- Vulnerability Assessment & Penetration Testing of systems outside the systems listed in this document.\n- Operational or disaster issues not caused by I3.' : 'Pengantaran jasa yang dijelaskan pada ruang lingkup pekerjaan tidak mencakupi hal-hal berikut ini:\n- Vulnerability Assessment & Penetration Testing terhadap sistem di luar sistem yang tercantum di dokumen ini.\n- Masalah operasional atau disaster, yang bukan disebabkan oleh I3.'))}</div>
    `);

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

    if (workspaceDocs['sub-1-5'] !== undefined || p.report_date) {
        const timelineHtml = `
        <h3 class="ssh">${tr(workspaceDocs['title_sub-1-5'] || "1.5. Timeline Kegiatan")}</h3>
        <div class="tb">${workspaceDocs['sub-1-5'] !== undefined ? renderContent(workspaceDocs['sub-1-5']) : renderContent(p.report_date ? tr(p.report_date) : '')}</div>
        `;
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(timelineHtml),
            html: timelineHtml
        });
    }

    if (workspaceDocs['sub-1-6'] !== undefined) {
        const owaspChecklistHtml = `<h3 class="ssh">${tr(workspaceDocs['title_sub-1-6'] || "1.6. OWASP TOP 10 Checklist")}</h3>${renderContent(workspaceDocs['sub-1-6'])}`;
        pushDynamicContent(owaspChecklistHtml, 'general');
    } else {
        const titleHtml = `<h3 class="ssh">${tr(owaspTitle)}</h3>`;
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(titleHtml),
            html: titleHtml
        });
        const theadHtml = `<thead><tr>${owaspColumns.map(col => {
            let style = ' style="text-align:center;"';
            return `<th${style}>${tr(col.name)}</th>`;
        }).join('')}</tr></thead>`;

        owaspRows.forEach(row => {
            const rowHtml = `<tr>${owaspColumns.map(col => {
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
            }).join('')}</tr>`;
            
            flowItems.push({
                type: 'owasp_row',
                height: Math.max(50, Math.ceil((row.col_name?.length || 50) / 60) * 22 + 20),
                html: rowHtml,
                theadHtml: theadHtml
            });
        });
    }

    const chartTitleHtml = `<h3 class="ssh">${tr(workspaceDocs['title_sub-1-7'] || "1.7. Ringkasan Temuan Celah Keamanan")}</h3>`;
    const riskBadgeHtml = `<div style="text-align:center; margin-top: 20px; margin-bottom: 25px;"><div class="risk-overall" style="border-color:${overallColor};color:${overallColor}; font-size:10pt; padding:6px 16px;">Overall Risk: <strong style="text-transform:uppercase;">${overallRisk}</strong></div></div>`;
    const chartAndBadgeHtml = (findingsChartHtml || '') + riskBadgeHtml;
    
    if (workspaceDocs['sub-1-7'] !== undefined) {
        const customFindingsHtml = chartTitleHtml + chartAndBadgeHtml + renderContent(workspaceDocs['sub-1-7']);
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(customFindingsHtml) + 50,
            html: customFindingsHtml
        });
    } else {
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(chartTitleHtml + chartAndBadgeHtml) + 50,
            html: chartTitleHtml + chartAndBadgeHtml
        });

        if (findings && findings.length > 0) {
            const theadHtml = `<thead><tr><th>${tr("No.")}</th><th>${tr("Temuan")}</th><th>${tr("Nilai CVSS")}</th><th>${tr("Klasifikasi Risiko")}</th><th>${tr("Status")}</th></tr></thead>`;
            
            findings.forEach((f, idx) => {
                const isLastChunk = (idx === findings.length - 1);
                const rowHtml = `<tr>
                    <td style="text-align:center;">F${(idx + 1).toString().padStart(2, '0')}</td>
                    <td><strong>${f.title}</strong></td>
                    <td style="text-align:center;font-weight:700;color:${sevColor[f.severity]||'#475569'};">${(f.cvss_score||0).toFixed(1)}</td>
                    <td><span class="svb" style="background:${sevBg[f.severity]||'#f8fafc'};color:${sevColor[f.severity]||'#475569'};">${f.severity?.toUpperCase()}</span></td>
                    <td style="color:${(f.status==='Open'||f.finding_status==='Open')?'#dc2626':'#16a34a'};font-weight:700;">${tr(f.status||f.finding_status||'OPEN')}</td>
                </tr>`;
                
                flowItems.push({
                    type: 'exec_row',
                    height: Math.max(50, Math.ceil((f.title?.length || 50) / 50) * 22 + 20),
                    html: rowHtml,
                    theadHtml: theadHtml
                });
                    
                if (isLastChunk) {
                    let tableChunkHtml = `
                    <div class="tb" style="margin-top:1rem;"><p>${lang === 'en' ? 'The main part of this report explains each risk in detail, followed by recommendations on technical resolution steps.' : 'Bagian utama dari laporan ini menjelaskan setiap risiko yang ada secara rinci, diikuti dengan rekomendasi tentang langkah-langkah penyelesaian teknis.'}</p></div>
                    `;
                    flowItems.push({
                        type: 'general',
                        height: estimateHtmlHeight(tableChunkHtml) + 50,
                        html: tableChunkHtml
                    });
                }
            });
        } else {
            const theadHtml = `<thead><tr><th>${tr("No.")}</th><th>${tr("Temuan")}</th><th>${tr("Nilai CVSS")}</th><th>${tr("Klasifikasi Risiko")}</th><th>${tr("Status")}</th></tr></thead>`;
            const rowHtml = `<tr><td colspan="5" style="text-align:center;color:#94a3b8;">${tr("Tidak ada temuan.")}</td></tr>`;
            flowItems.push({
                type: 'exec_row',
                height: 50,
                html: rowHtml,
                theadHtml: theadHtml
            });

        const tableChunkHtml = `
        <div class="tb" style="margin-top:1rem;"><p>${lang === 'en' ? 'The main part of this report explains each risk in detail, followed by recommendations on technical resolution steps.' : 'Bagian utama dari laporan ini menjelaskan setiap risiko yang ada secara rinci, diikuti dengan rekomendasi tentang langkah-langkah penyelesaian teknis.'}</p></div>
        `;
        flowItems.push({
            type: 'general',
            height: estimateHtmlHeight(tableChunkHtml) + 50,
            html: tableChunkHtml
        });
    }
    } // This closes the else block from line 765!

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
    <h2 class="sh-blue">${tr(workspaceDocs['title_sec-2'] || "2. METODOLOGI")}</h2>
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
        ${renderContent(p.flow_description || (lang === 'en' ? `<table class="tbl" style="width:100%; border-collapse:collapse; margin-top:1rem;"><tbody><tr><td style="width:25%; font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Planning</td><td style="border:1px solid #000; padding:8px;">Agreement between parties and rules of engagement.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Information Gathering</td><td style="border:1px solid #000; padding:8px;">Actively and passively collecting information.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Assessment</td><td style="border:1px solid #000; padding:8px;">Finding vulnerabilities (Vulnerability Assessment) and simulating attacks.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Testing</td><td style="border:1px solid #000; padding:8px;">Performing testing (Penetration Testing) based on OWASP Top 10.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Report</td><td style="border:1px solid #000; padding:8px;">Analyzing data and writing the report.</td></tr></tbody></table>` : `<table class="tbl" style="width:100%; border-collapse:collapse; margin-top:1rem;"><tbody><tr><td style="width:25%; font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Planning</td><td style="border:1px solid #000; padding:8px;">Perjanjian antar pihak dan aturan keterlibatan.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Information Gathering</td><td style="border:1px solid #000; padding:8px;">Mengumpulkan informasi secara aktif dan pasif.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Assessment</td><td style="border:1px solid #000; padding:8px;">Mencari celah (Vulnerability Assessment) dan mensimulasikan serangan.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Testing</td><td style="border:1px solid #000; padding:8px;">Melakukan testing (Penetration Testing) berdasarkan OWASP Top 10.</td></tr><tr><td style="font-weight:bold; border:1px solid #000; padding:8px; background:#f1f5f9;">Report</td><td style="border:1px solid #000; padding:8px;">Menganalisis data dan menuliskan laporan.</td></tr></tbody></table>`))}
    </div>
    `;

    const methodologyHtml1b = `
    <h3 class="ssh">${tr(workspaceDocs['title_sub-2-1'] || "2.1. Risk Assessment")}</h3>
    ${workspaceDocs['sub-2-1'] !== undefined ? renderContent(workspaceDocs['sub-2-1']) : `
    <table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; font-family:'Arimo',sans-serif; font-size:9.5pt; margin-bottom: 1.5rem;">
        <thead>
            <tr>
                <th style="width:15%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">CVSS Score</th>
                <th style="width:20%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">${tr("Severity")}</th>
                <th style="width:65%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">${tr("Definition")}</th>
            </tr>
        </thead>
        <tbody>
            ${riskData.map(r => {
                const sevMap = {
                    'NONE': { bg: '#f1f5f9', fg: '#64748b', def: 'Tidak ada kerentanan yang ada.' },
                    'LOW': { bg: '#ecfdf5', fg: '#10b981', def: 'Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan.' },
                    'MEDIUM': { bg: '#fff7ed', fg: '#f59e0b', def: 'Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah tambahan.' },
                    'HIGH': { bg: '#fef2f2', fg: '#ef4444', def: 'Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan kehilangan data.' },
                    'CRITICAL': { bg: '#f5f3ff', fg: '#8b5cf6', def: 'Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.' }
                };
                const sev = r.severity.toUpperCase();
                const colors = sevMap[sev] || { bg: '#f8fafc', fg: '#64748b', def: r.def };
                return `
                <tr>
                    <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">${r.score}</td>
                    <td style="padding:10px; border:1px solid #e2e8f0;"><span style="background-color:${colors.bg}; color:${colors.fg}; padding:4px 10px; border-radius:9999px; font-weight:bold; font-size:8pt; display:inline-block;">${sev}</span></td>
                    <td style="padding:10px; border:1px solid #e2e8f0;">${colors.def}</td>
                </tr>
                `;
            }).join('')}
        </tbody>
    </table>`}
    `;

    const methodologyHtml2 = `
    <h3 class="ssh">${tr("2.2. Penetration Testing Tools")}</h3>
    ${workspaceDocs['sub-2-2'] !== undefined ? renderContent(workspaceDocs['sub-2-2']) : `
    <table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; font-family:'Arimo',sans-serif; font-size:9.5pt; margin-bottom: 1.5rem;">
        <thead>
            <tr>
                <th style="width:33.33%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">${lang === 'en' ? 'Information Gathering' : 'Information Gathering'}</th>
                <th style="width:33.33%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">${lang === 'en' ? 'Assessment' : 'Assessment'}</th>
                <th style="width:33.33%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">${lang === 'en' ? 'Exploit/Tools' : 'Exploit/Tools'}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding:10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6;">
                    ${(() => {
                        const tools = (p.used_tools || 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb').split(',');
                        return tools.slice(0, 4).map(t => t.trim()).join('<br>');
                    })()}
                </td>
                <td style="padding:10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6;">
                    ${(() => {
                        const tools = (p.used_tools || 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb').split(',');
                        return tools.slice(4, 9).map(t => t.trim()).join('<br>');
                    })()}
                </td>
                <td style="padding:10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6;">
                    ${(() => {
                        const tools = (p.used_tools || 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb').split(',');
                        return tools.slice(9).map(t => t.trim()).join('<br>');
                    })()}
                </td>
            </tr>
        </tbody>
    </table>`}
    `;
    flowItems.push({
        type: 'general',
        sectionId: 'sec-2',
        height: estimateHtmlHeight(methodologyHtml1),
        html: methodologyHtml1
    });
    flowItems.push({
        type: 'general',
        sectionId: 'sec-2',
        height: estimateHtmlHeight(methodologyHtml1b),
        html: methodologyHtml1b
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

    let activeSubs = defaultSubs;
    let introText = defaultTechnicalIntro;
    
    try {
        if (p.technical_report) {
            const parsed = JSON.parse(p.technical_report);
            if (Array.isArray(parsed)) {
                const ch3 = parsed.find(sec => sec.id === 'sec-3' || sec.title.toLowerCase().includes('laporan teknis') || sec.title.toLowerCase().includes('findings'));
                if (ch3) {
                    if (ch3.content) introText = ch3.content;
                    if (Array.isArray(ch3.subsections) && ch3.subsections.length > 0) {
                        activeSubs = ch3.subsections;
                    }
                }
            } else if (parsed && Array.isArray(parsed.subsections)) {
                activeSubs = parsed.subsections;
                if (parsed.intro) introText = parsed.intro;
            }
        }
    } catch(e) {
        console.error("Error parsing techReport in Chapter 3:", e);
    }

    const introHtml = `<div class="tb">${renderContent(introText)}</div>`;

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
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 45%;">${tr("Judul Temuan")}</th>
                <th style="border: 1px solid #000; color: #fff; padding: 7px 10px; text-align: center; font-weight: 700; width: 22%;">${tr("Sistem Terdampak")}</th>
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
                const parts = f.affected_system.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
                if (parts.length > 0) {
                    affectedHtml = '<ul style="margin: 0; padding-left: 15px; text-align: left; list-style-type: disc;">' + 
                        parts.map(p => '<li style="margin-bottom: 2px;">' + p + '</li>').join('') + 
                        '</ul>';
                }
            }

            return `
            <tr>
                <td style="border: 1px solid #000; padding: 8px 10px; text-align: center;">F${(i+1).toString().padStart(2, '0')}</td>
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
    <h2 class="sh-blue">${tr(workspaceDocs['title_sec-3'] || "3. LAPORAN TEKNIS")}</h2>
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
                if (!val) return 50;
                const str = String(val).trim();
                if (!str || str === '-') return 50;

                // Add 20px padding (top+bottom) to all text-based height calculations
                switch (type) {
                    case 'title': return Math.max(50, Math.ceil(str.length / 50) * 22 + 20);
                    case 'affected': return Math.max(50, Math.ceil(str.length / 60) * 22 + 20);
                    case 'cvss': return 120;
                    case 'status':
                    case 'retest_status': return 50;
                    case 'script':
                    case 'script_payload':
                        const lines = str.split('\n').length;
                        return Math.max(50, lines * 18 + 30); // Pre code block has more padding
                    case 'reference':
                    case 'references':
                        const refCount = str.split('\n').filter(r => r.trim()).length;
                        return Math.max(50, refCount * 45 + 30);
                    case 'poc':
                        const isImg = str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://');
                        if (isImg) return 340; 
                        return estimateHtmlHeight(renderContent(str, true)) + 20;
                    case 'description':
                    case 'exploitation':
                    case 'impact':
                    case 'solution':
                    case 'step_reproduce':
                    case 'retest_evidence':
                        return estimateHtmlHeight(renderContent(str, true)) + 20;
                    default:
                        const rawText = str.replace(/<[^>]*>/g, '');
                        return Math.max(50, Math.ceil(rawText.length / 60) * 22 + 20);
                }
            };

            if (f.page_break_before === 1 || f.page_break_before === true) {
                flowItems.push({
                    type: 'page_break',
                    height: 0,
                    html: ''
                });
            }
            
            if (f.extra_spacing && parseInt(f.extra_spacing) > 0) {
                const spc = parseInt(f.extra_spacing);
                flowItems.push({
                    type: 'spacing',
                    height: spc,
                    html: `<div style="height:${spc}px; width:100%;"></div>`
                });
            }

            flowItems.push({
                type: 'heading',
                height: 40,
                html: `<h3 class="ssh" style="border-left-color:${sc}; font-size:11pt; font-weight:800; margin-top:1.8rem;">3.3.1.${idx+1} (F${(idx + 1).toString().padStart(2, '0')}) ${f.title}</h3>`
            });

            const splitMarkdownToRows = (label, labelEn, mdContent, typeKey) => {
                if (!mdContent || typeof mdContent !== 'string') return [
                    { type: typeKey, val: mdContent, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? labelEn : label}</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${'<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` }
                ];
                
                if (mdContent.trim().startsWith('data:image/') || mdContent.trim().startsWith('http://') || mdContent.trim().startsWith('https://')) {
                     return [{ type: typeKey, val: mdContent, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? labelEn : label}</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;"><div style="text-align:center; margin:0.5rem 0;"><img src="${mdContent}" style="max-width:100%; border:1px solid #000;" alt="${label}"><div style="font-size:7.5pt; color:#64748b; margin-top:4px;">${lang === 'en' ? 'Figure' : 'Gambar'} ${captionCounter++}. ${labelEn}</div></div></td></tr>` }];
                }
                
                // Split markdown by double newline to separate paragraphs/images
                const blocks = mdContent.split(/\n{2,}/).filter(b => b.trim() !== '');
                if (blocks.length === 0) {
                    return [{ type: typeKey, val: mdContent, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? labelEn : label}</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${'<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` }];
                }
                
                return blocks.map((block, i) => {
                    const isFirst = i === 0;
                    const isLast = i === blocks.length - 1;
                    
                    const borderTop = isFirst ? '1px solid #000' : 'none';
                    const borderBottom = isLast ? '1px solid #000' : 'none';
                    
                    const leftStyle = `background:${sc}; color:${isFirst ? '#fff' : 'transparent'}; font-weight:bold; padding:8px 12px; border-left:1px solid #000; border-right:1px solid #000; border-top:${borderTop}; border-bottom:${borderBottom}; width:20%; text-align:left; vertical-align:top;`;
                    
                    const rightStyle = `padding:8px 12px; border-left:1px solid #000; border-right:1px solid #000; border-top:${borderTop}; border-bottom:${borderBottom}; line-height:1.6;`;
                    
                    const labelText = isFirst ? (lang === 'en' ? labelEn : label) : '&nbsp;';
                    return {
                        type: typeKey,
                        val: block,
                        html: `<tr><td style="${leftStyle}">${labelText}</td><td style="${rightStyle}">${renderContent(block)}</td></tr>`
                    };
                });
            };

            let rowsData = [
                { type: 'title', val: f.title, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left;">${lang === "en" ? "Finding Title" : "Judul Temuan"}</td><td style="padding:8px 12px; border:1px solid #000; font-weight:bold; font-size:10pt;">${f.title}</td></tr>` },
                { type: 'affected', val: f.affected_system, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left;">${lang === "en" ? "Affected System" : "Sistem Terdampak"}</td><td style="padding:8px 12px; border:1px solid #000; color:#0f62fe; text-decoration:underline; font-weight:500; font-family:monospace; word-break:break-all;">${f.affected_system || '-'}</td></tr>` },
                { type: 'severity', val: f.severity, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left;">${lang === "en" ? "Severity" : "Tingkat Risiko"}</td><td style="padding:8px 12px; border:1px solid #000;"><span style="background-color: ${sevBg[f.severity] || '#eff6ff'}; color: ${sevColor[f.severity] || '#0284c7'}; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 8.5pt; display: inline-block; border: 1px solid ${sevColor[f.severity]}33;">${f.severity || 'Info'}</span></td></tr>` },
                { type: 'cvss', val: f.cvss_vector, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left;">${lang === "en" ? "CVSS Calculator" : "Kalkulator CVSS"}</td><td style="padding:8px 12px; border:1px solid #000; font-weight:500;"><div style="font-weight:bold; margin-bottom:4px;">${f.cvss_version || 'CVSS v3.1'}</div><div style="font-family:monospace; font-size:8.5pt; margin-bottom:4px; word-break:break-all;"><strong>Vector:</strong> ${f.cvss_vector || '-'}</div><div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;"><strong>Score:</strong> ${(f.cvss_score || 0).toFixed(1)}</div></td></tr>` },
                { type: 'status', val: f.finding_status || f.status, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left;">${lang === "en" ? "Finding Status" : "Status Temuan"}</td><td style="padding:8px 12px; border:1px solid #000;">${(() => { const val = f.finding_status || f.status || 'Open'; const isOp = val.toLowerCase() === 'open'; return `<span style="background-color: ${isOp ? '#def7ec' : '#e0f2fe'}; color: ${isOp ? '#03543f' : '#0369a1'}; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 8.5pt; display: inline-block; border: 1px solid ${isOp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)'};">${val}</span>`; })()}</td></tr>` },
                { type: 'retest_status', val: f.status || f.finding_status, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left;">${lang === "en" ? "Retest Status" : "Status Retest"}</td><td style="padding:8px 12px; border:1px solid #000;">${(() => { const val = f.status || f.finding_status || 'Open'; const valL = val.toLowerCase(); const bg = valL === 'open' ? '#def7ec' : (valL === 'fixed' || valL === 'closed' ? '#e0f2fe' : '#fef3c7'); const fg = valL === 'open' ? '#03543f' : (valL === 'fixed' || valL === 'closed' ? '#0369a1' : '#b45309'); const bd = valL === 'open' ? 'rgba(16, 185, 129, 0.2)' : (valL === 'fixed' || valL === 'closed' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(245, 158, 11, 0.2)'); return `<span style="background-color: ${bg}; color: ${fg}; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 8.5pt; display: inline-block; border: 1px solid ${bd};">${val}</span>`; })()}</td></tr>` },
                ...splitMarkdownToRows("Deskripsi", "Description", f.description, 'description'),
                ...splitMarkdownToRows("Bukti Kerentanan (PoC)", "Proof of Vulnerability (PoC)", f.poc, 'poc'),
                ...splitMarkdownToRows("Eksploitasi", "Exploitation", f.exploitation, 'exploitation'),
                ...splitMarkdownToRows("Dampak", "Impact", f.impact, 'impact'),
                { type: 'script_payload', val: f.script_payload, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? "Script/Payload" : "Skrip/Payload"}</td><td style="padding:8px 12px; border:1px solid #000;">${f.script_payload ? `<pre style="font-family:'Courier New', monospace; font-size:8pt; background:#f1f5f9; padding:6px 10px; border:1px solid #cbd5e1; border-radius:3px; overflow-x:auto; margin:0;"><code>${f.script_payload}</code></pre>` : '<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` },
                ...splitMarkdownToRows("Rekomendasi/Solusi", "Solution", f.solution, 'solution'),
                { type: 'reference', val: f.reference, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? "References" : "Referensi"}</td><td style="padding:8px 12px; border:1px solid #000; line-height:1.6;">${f.reference ? `<ul style="margin:0; padding-left:1.2rem;">${f.reference.split('\n').filter(r=>r.trim()).map(r=>{ let t = r.trim().replace(/^[-*•\u2022]\s*/, ''); t = t.replace(/(https?:\/\/[^\s]+)/gi, '<a href="$1" style="color:#0f62fe; word-break:break-all;" target="_blank">$1</a>'); return `<li style="margin-bottom:4px;"><span style="word-break:break-word;">${t}</span></li>`; }).join('')}</ul>` : '<p style="color:#94a3b8;font-style:italic;">-</p>'}</td></tr>` },
                ...splitMarkdownToRows("Langkah Reproduksi", "Steps to Reproduce", f.step_reproduce, 'step_reproduce'),
                { type: 'cwe', val: f.cwe, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">CWE (Common Weakness Enumeration)</td><td style="padding:8px 12px; border:1px solid #000;">${f.cwe ? `<ul style="margin:0; padding-left:1.2rem;">${f.cwe.split('\\n').filter(r=>r.trim()).map(r=>`<li>${r.trim()}</li>`).join('')}</ul>` : '-'}</td></tr>` },
                { type: 'mitre_attack', val: f.mitre_attack, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? "MITRE ATT&CK Technique" : "Teknik MITRE ATT&CK"}</td><td style="padding:8px 12px; border:1px solid #000;">${f.mitre_attack ? `<ul style="margin:0; padding-left:1.2rem;">${f.mitre_attack.split('\\n').filter(r=>r.trim()).map(r=>`<li>${r.trim()}</li>`).join('')}</ul>` : '-'}</td></tr>` },
                { type: 'iso_27001', val: f.iso_27001, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? "ISO 27001 Annex A Control" : "Kontrol ISO 27001 Annex A"}</td><td style="padding:8px 12px; border:1px solid #000;">${f.iso_27001 ? `<ul style="margin:0; padding-left:1.2rem;">${f.iso_27001.split('\\n').filter(r=>r.trim()).map(r=>`<li>${r.trim()}</li>`).join('')}</ul>` : '-'}</td></tr>` },
                { type: 'nist_control', val: f.nist_control, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? "NIST SP 800-53 Control" : "Kontrol NIST SP 800-53"}</td><td style="padding:8px 12px; border:1px solid #000;">${f.nist_control ? `<ul style="margin:0; padding-left:1.2rem;">${f.nist_control.split('\\n').filter(r=>r.trim()).map(r=>`<li>${r.trim()}</li>`).join('')}</ul>` : '-'}</td></tr>` },
                { type: 'ptes_phase', val: f.ptes_phase, html: `<tr><td style="background:${sc}; color:#fff; font-weight:bold; padding:8px 12px; border:1px solid #000; width:20%; text-align:left; vertical-align:top;">${lang === "en" ? "PTES Assessment Phase" : "Fase Penilaian PTES"}</td><td style="padding:8px 12px; border:1px solid #000;">${f.ptes_phase ? `<ul style="margin:0; padding-left:1.2rem;">${f.ptes_phase.split('\\n').filter(r=>r.trim()).map(r=>`<li>${r.trim()}</li>`).join('')}</ul>` : '-'}</td></tr>` },
                ...splitMarkdownToRows("Bukti Retest", "Retest Evidence", f.retest_evidence, 'retest_evidence')
            ];

            const optionalRefs = ['cwe', 'mitre_attack', 'iso_27001', 'nist_control', 'ptes_phase'];
            rowsData = rowsData.filter(r => {
                if (optionalRefs.includes(r.type)) {
                    return !!r.val && r.val.trim() !== '';
                }
                return true;
            });

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
        if (sec.enabled === false || ['cover','toc','background','methodology','findings','appendix', 'sec-1', 'sec-2', 'sec-3', 'sec-4'].includes(sec.id)) return;
        
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
    // --- BAB 4: APPENDIX ---
    let appHtml = `<h2 class="sh-blue">${tr(workspaceDocs['title_sec-4'] || "BAB 4. APPENDIX (CATATAN PENGETESAN)")}</h2>`;
    const sec4Intro = workspaceDocs['sec-4'];
    if (sec4Intro && sec4Intro.trim() !== '') {
        appHtml += `<div class="tb">${renderContent(sec4Intro)}</div>`;
    }
    
    let hasAppContent = false;
    const sec4Subs = workspaceDocs['subs_sec-4'];
    if (sec4Subs && sec4Subs.length > 0) {
        sec4Subs.forEach(sub => {
            const subContent = workspaceDocs[sub.id];
            if (subContent && subContent.trim() !== '') {
                appHtml += `<h3 class="ssh">${tr(workspaceDocs['title_' + sub.id] || sub.title || "4.1 Catatan Tambahan")}</h3>`;
                appHtml += `<div class="tb">${renderContent(subContent)}</div>`;
                hasAppContent = true;
            }
        });
    } else {
        // Fallback for old projects
        const appContent = workspaceDocs['sub-4-1'] !== undefined ? workspaceDocs['sub-4-1'] : p.appendix;
        if (appContent && appContent.trim() !== '') {
            appHtml += `<h3 class="ssh">${tr(workspaceDocs['title_sub-4-1'] || "4.1 Catatan Tambahan")}</h3>`;
            appHtml += `<div class="tb">${renderContent(appContent)}</div>`;
            hasAppContent = true;
        }
    }

    if (hasAppContent || (sec4Intro && sec4Intro.trim() !== '')) {
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
        if (html.includes('<h2 class=\"sh-blue\">' + tr(workspaceDocs['title_sec-1'] || '1. RINGKASAN EKSEKUTIF') + '</h2>') || html.includes('<h2 class="sh-blue">1. RINGKASAN EKSEKUTIF</h2>')) {
            currentSectionId = 'sec-1';
        } else if (html.includes('<h2 class=\"sh-blue\">' + tr(workspaceDocs['title_sec-2'] || '2. METODOLOGI') + '</h2>') || html.includes('<h2 class="sh-blue">2. METODOLOGI</h2>')) {
            currentSectionId = 'sec-2';
        } else if (html.includes('<h2 class=\"sh-blue\">' + tr(workspaceDocs['title_sec-3'] || '3. LAPORAN TEKNIS') + '</h2>') || html.includes('<h2 class="sh-blue">3. LAPORAN TEKNIS</h2>') || html.includes('<h2 class="sh-blue">BAB 3. LAPORAN TEKNIS (FINDINGS)</h2>')) {
            currentSectionId = 'sec-3';
        } else if (html.includes('<h2 class=\"sh-blue\">' + tr(workspaceDocs['title_sec-4'] || 'BAB 4. APPENDIX (CATATAN PENGETESAN)') + '</h2>')) {
            currentSectionId = 'sec-4';
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
        // Adjust threshold based on user spacing preference to minimize empty space while preventing overflow.
        let threshold = 760; // Default (Longgar)
        if (spacingMult <= 1.0) threshold = 860; // Rapat
        else if (spacingMult <= 1.2) threshold = 810; // Normal

        if (item.type === 'page_break') {
            if (currentChunk.length > 0) {
                pageChunks.push(currentChunk);
            }
            currentChunk = [];
            currentChunkHeight = 30;
            return;
        }

        if (currentChunkHeight + item.height > threshold && currentChunk.length > 0) {
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
                if (titleText.toLowerCase() === 'daftar isi' || titleText.toLowerCase() === 'pratinjau' || titleText.toLowerCase() === 'table of contents' || titleText.toLowerCase() === 'preview') continue;
                
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
    let currentBodyChapterTitle = '';
    pageChunks.forEach((chunkItems, chunkIdx) => {
        let chunkHtml = '';
        let inTable = false;
        let inOwaspTable = false;
        let inExecTable = false;
        let inDynamicTable = false;
        let currentDynamicThead = '';
        let currentDynamicClass = 'tbl';
        let currentTableFindingIdx = -1;

        const closeAllTables = () => {
            if (inTable) { chunkHtml += `</tbody></table>`; inTable = false; }
            if (inOwaspTable) { chunkHtml += `</tbody></table>`; inOwaspTable = false; }
            if (inExecTable) { chunkHtml += `</tbody></table>`; inExecTable = false; }
            if (inDynamicTable) { chunkHtml += `</tbody></table>`; inDynamicTable = false; }
        };

        chunkItems.forEach(item => {
            let match;
            const h2Regex = /<h2 class="sh-blue"[^>]*>(.*?)<\/h2>/g;
            while ((match = h2Regex.exec(item.html)) !== null) {
                const titleText = match[1].replace(/<[^>]*>/g, '').trim();
                if (titleText.toLowerCase() !== 'daftar isi' && titleText.toLowerCase() !== 'pratinjau') {
                    currentBodyChapterTitle = titleText;
                }
            }

            if (item.type === 'general' || item.type === 'heading') {
                closeAllTables();
                chunkHtml += item.html;
            } else if (item.type === 'row') {
                if (inOwaspTable || inExecTable || inDynamicTable) closeAllTables();
                if (!inTable || currentTableFindingIdx !== item.findingIdx) {
                    if (inTable) {
                        chunkHtml += `</tbody></table>`;
                    }
                    const tableMarginTop = inTable ? '10px' : '0px';
                    chunkHtml += `<table style="width:100%; border-collapse:collapse; table-layout:fixed; word-wrap:break-word; font-family:'Arimo',Arial, sans-serif; font-size:9.5pt; border:1.5px solid #000; margin-bottom:1.5rem; margin-top:${tableMarginTop};"><tbody>`;
                    inTable = true;
                    currentTableFindingIdx = item.findingIdx;
                }
                chunkHtml += item.html;
            } else if (item.type === 'owasp_row') {
                if (inTable || inExecTable || inDynamicTable) closeAllTables();
                if (!inOwaspTable) {
                    chunkHtml += `<table class="tbl">${item.theadHtml}<tbody>`;
                    inOwaspTable = true;
                }
                chunkHtml += item.html;
            } else if (item.type === 'exec_row') {
                if (inTable || inOwaspTable || inDynamicTable) closeAllTables();
                if (!inExecTable) {
                    chunkHtml += `<table class="tbl">${item.theadHtml}<tbody>`;
                    inExecTable = true;
                }
                chunkHtml += item.html;
            } else if (item.type === 'dynamic_table_row') {
                if (inTable || inOwaspTable || inExecTable) closeAllTables();
                if (!inDynamicTable) {
                    currentDynamicThead = item.theadHtml || '';
                    currentDynamicClass = item.tableClass || 'tbl';
                    chunkHtml += `<table class="${currentDynamicClass}" style="width:100%; border-collapse:collapse; margin-top:1rem;">${currentDynamicThead}<tbody>`;
                    inDynamicTable = true;
                }
                chunkHtml += item.html;
            }
        });

        closeAllTables();

        bodyPages += mkPage(`page-body-${chunkIdx+1}`, chunkHtml, false, currentBodyChapterTitle);
    });

    // Reset pageNum and compile the dynamic TOC HTML
    pageNum = tpl ? ((tpl.start_page_num !== undefined && tpl.start_page_num !== null) ? parseInt(tpl.start_page_num) : 2) - 2 : 0;
    
    // Page 1: Cover
    pageNum++;
    
    // Page 2: Pratinjau
    const finalPratinjauHtml = mkPage('page-pratinjau', revContent, false, 'Pratinjau');
    
    // Page 3: Dynamic TOC
    let dynamicTocHtml = '';
    if (hasToc) {
        let tocContentHtml = `<h2 class="sh-blue">${tr("DAFTAR ISI")}</h2><div class="toc">`;
        tocContentHtml += `<div class="toc-row toc-main"><span class="toc-t">${tr("DAFTAR ISI")}</span><span class="toc-dots"></span><span class="toc-p">ii</span></div>`;
        tocContentHtml += `<div class="toc-row toc-main"><span class="toc-t">${tr("PRATINJAU")}</span><span class="toc-dots"></span><span class="toc-p">iii</span></div>`;
        
        dynamicTocRows.forEach(row => {
            tocContentHtml += `<div class="toc-row toc-main"><span class="toc-t">${row.title}</span><span class="toc-dots"></span><span class="toc-p">${row.pg}</span></div>`;
            if (row.children && row.children.length > 0) {
                row.children.forEach(c => {
                    tocContentHtml += `<div class="toc-row toc-child"><span class="toc-t">&nbsp;&nbsp;&nbsp;&nbsp;${c.title}</span><span class="toc-dots"></span><span class="toc-p">${c.pg}</span></div>`;
                });
            }
        });
        tocContentHtml += `</div>`;
        dynamicTocHtml = mkPage('page-toc', tocContentHtml, false, 'Daftar Isi');
    }
    
    // Combine everything in order
    pages = coverHtml + finalPratinjauHtml + dynamicTocHtml + bodyPages;

    // Check if user is allowed to download (PIC or Admin)
    const canDownload = typeof canEditProject === 'function' ? canEditProject(p) : false;

    // ══ FINAL HTML DOCUMENT ══════════════════════════════════════
    const finalResultHtml = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview: ${p.name} — Vulnerability Assessment Report</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;background:#c8cdd6;color:#0f172a;min-height:100vh;line-height:1.5;text-align:justify;}
p { text-align: justify; line-height: 1.5; margin-bottom: 0.8rem; }

/* Quill Text Align Classes */
.ql-align-center { text-align: center !important; }
.ql-align-right { text-align: right !important; }
.ql-align-justify { text-align: justify !important; }
.ql-align-left { text-align: left !important; }


${!canDownload ? `
@media print { body { display: none !important; } }
</style>
<script>
window.onbeforeprint = function(event) {
    alert('Akses Ditolak: Anda tidak memiliki izin untuk mengunduh atau mencetak laporan ini.');
};
<\/script>
<style>
` : ''}

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
.tb{font-size:9.5pt;line-height:1.5 !important;color:#1e293b;text-align:justify !important;}
.tb p,.page-content>p{margin-bottom:calc(8px * var(--spacing-mult));line-height:1.5 !important;text-align:justify !important;}
.tb ul,.tb ol{padding-left:1.4rem;margin:calc(8px * var(--spacing-mult)) 0;}
.tb li{margin-bottom:calc(4px * var(--spacing-mult));}
.tb h1{font-size:12pt;font-weight:800;border-bottom:2px solid #e2e8f0;padding-bottom:3px;margin:.8rem 0 .4rem;}
.tb h2{font-size:10.5pt;font-weight:700;border-left:4px solid #1e3a5f;padding-left:.5rem;margin:.7rem 0 .35rem;background:#f0f4fa;padding:.25rem .5rem;}
.tb h3{font-size:10pt;font-weight:700;border-left:3px solid #94a3b8;padding-left:.5rem;margin:.6rem 0 .3rem;}
.tb blockquote{border-left:4px solid #1e3a5f;padding:.45rem .85rem;background:#f0f4fa;color:#475569;margin:.6rem 0;font-style:italic;}
.tb code,.tb pre{font-family:'Courier New',monospace;font-size:8pt;background:#f1f5f9;padding:1px 4px;border-radius:3px;}
.tb pre{display:block;padding:.45rem .7rem;margin:.45rem 0;overflow-x:auto;}
.tb img{max-width:100%;height:auto;border-radius:4px;margin:.45rem auto;display:block;}
.tb table{width:100%;border-collapse:collapse;margin:calc(12px * var(--spacing-mult)) 0;font-size:9pt;}
.tb table th{background:#1e3a5f;color:#fff;padding:calc(6px * var(--spacing-mult)) 9px;text-align:center;font-weight:700;font-size:8.5pt;border:1px solid #1e3a5f;}
.tb table td{padding:calc(5.5px * var(--spacing-mult)) 9px;border:1px solid #e2e8f0;vertical-align:top;}
.tb table tr:first-child td, .tb table tr:first-child th{background:#1e3a5f !important;color:#fff !important;font-weight:700;font-size:8.5pt;border:1px solid #1e3a5f;text-align:center !important;}
.tb table tr:nth-child(even) td{background:#f8fafc;}

/* ── Tables ── */
.tbl{width:100%;border-collapse:collapse;margin:calc(12px * var(--spacing-mult)) 0;font-size:9pt;}
.tbl th{background:#1e3a5f;color:#fff;padding:calc(6px * var(--spacing-mult)) 9px;text-align:center;font-weight:700;font-size:8.5pt;border:1px solid #1e3a5f;}
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
.risk-overall{display:inline-block;border:1.5px solid;padding:2px 10px;font-size:7.5pt;font-weight:900;letter-spacing:.04em;margin-top:.5rem;border-radius:3px;}

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

    ${canDownload ? `
    <button class="ptbtn ptbtn-print" onclick="logAndPrint(${p.id})" style="background:#64748b; display:none;">&#128424;&#65039; Print (No Password)</button>
    ${p.is_approved ? 
        `<button class="ptbtn ptbtn-print" onclick="requestSecurePdf(${p.id})" style="background:#2563eb;">&#128274; Download Secure PDF</button>` : 
        `<button class="ptbtn ptbtn-print" disabled style="background:#94a3b8; cursor:not-allowed;" title="Menunggu Approval dari Lead Pentester">&#8987; Pending Lead Approval</button>`
    }
    ` : ''}
    <button class="ptbtn ptbtn-close" onclick="window.close()">&#x2715; ${lang === 'en' ? 'Close' : 'Tutup'}</button>
</div>

<div class="dw">
${pages}
</div>

<div id="print-auth-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;font-family:sans-serif;">
    <div style="background:#fff;padding:2rem;border-radius:8px;width:350px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <h3 style="margin:0 0 1rem 0;color:#1e3a5f;font-size:1.1rem;">Generate Secure PDF</h3>
        <p style="font-size:0.85rem;color:#64748b;margin-bottom:1rem;">Silakan masukkan password untuk mengenkripsi PDF ini.</p>
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
            <input type="text" id="print-pwd-input" style="flex:1;padding:0.6rem;border:1px solid #cbd5e1;border-radius:4px;font-size:0.9rem;" placeholder="Password..." />
            <button onclick="generateRandomPassword()" style="padding:0.6rem 0.8rem;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:4px;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:0.3rem;" title="Generate Secure Password">&#128273; Generate</button>
        </div>
        
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
var currentPdfProjectId = null;

function logAndPrint(projectId) {
    const apiUrl = window.location.origin + '/api/projects/' + projectId + '/log_download';
    fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PRINT' })
    }).catch(e => console.error(e)).finally(() => {
        window.print();
    });
}

function generateRandomPassword() {
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const specials = "!@#$%^&*()_+~|}{[]:;?><,./-=";
    
    let pwd = "";
    pwd += uppers[Math.floor(Math.random() * uppers.length)];
    pwd += nums[Math.floor(Math.random() * nums.length)];
    pwd += specials[Math.floor(Math.random() * specials.length)];
    
    const all = lowers + uppers + nums + specials;
    for (let i = 0; i < 9; i++) {
        pwd += all[Math.floor(Math.random() * all.length)];
    }
    
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    
    const input = document.getElementById('print-pwd-input');
    input.value = pwd;
    input.type = 'text'; // Show the password to the user
}

function requestSecurePdf(projectId) {
    currentPdfProjectId = projectId;
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
    
    // Log download action
    fetch(window.location.origin + '/api/projects/' + (currentPdfProjectId || '${p.id}') + '/log_download', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PDF' })
    }).catch(e => console.error("Failed to log download"));
    
    fetch(window.location.origin + '/api/export_secure_pdf/' + currentPdfProjectId, {
        method: 'POST',
        credentials: 'include',
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
<script src="/static/js/cwe-db.js"></script>
</body>
</html>`;

    if (!finalResultHtml) {
        alert("CRITICAL ERROR IN PREVIEW BUILDER: finalResultHtml is falsy! Type: " + typeof finalResultHtml);
    }
    return finalResultHtml;
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

window.renderConsolidatedPreview = function(projectsData, companyName) {
    if (!projectsData || projectsData.length === 0) return;
    
    let fullHtml = '';
    
    projectsData.forEach((p, idx) => {
        let tpl = null;
        let struct = null;
        if (typeof cacheStore !== 'undefined' && cacheStore.reportTemplates && cacheStore.reportTemplates.length > 0) {
            tpl = cacheStore.reportTemplates[0];
            struct = tpl.structure;
        }
        
        if (!struct) struct = [];
        
        // _buildPreviewDocument returns a full HTML string including <html><body> etc.
        let htmlStr = _buildPreviewDocument(p, p.findings || [], tpl, struct, 'id', false, 1.4);
        
        // We need to inject page breaks between projects
        if (idx < projectsData.length - 1) {
            htmlStr += '<div style="page-break-after: always; clear: both; margin: 2rem 0; border-bottom: 2px dashed #ccc;"></div>';
        }
        fullHtml += htmlStr;
    });

    let combinedHead = '';
    let combinedBody = '';
    
    projectsData.forEach((p, idx) => {
        let tpl = null;
        let struct = null;
        if (typeof cacheStore !== 'undefined' && cacheStore.reportTemplates && cacheStore.reportTemplates.length > 0) {
            tpl = cacheStore.reportTemplates[0];
            struct = tpl.structure;
        }
        
        if (!struct) struct = [];
        
        let htmlStr = _buildPreviewDocument(p, p.findings || [], tpl, struct, 'id', false, 1.4);
        
        // Extract head and body
        const headMatch = htmlStr.match(/<head>([\s\S]*?)<\/head>/i);
        const bodyMatch = htmlStr.match(/<body>([\s\S]*?)<\/body>/i);
        
        if (idx === 0 && headMatch) {
            combinedHead = headMatch[1];
        }
        
        if (bodyMatch) {
            combinedBody += bodyMatch[1];
            if (idx < projectsData.length - 1) {
                combinedBody += '<div style="page-break-after: always; clear: both; margin: 2rem 0; border-bottom: 2px dashed #ccc;"></div>';
            }
        } else {
            // fallback if no body tag
            combinedBody += htmlStr;
        }
    });
    
    const finalHtml = `<!DOCTYPE html>
<html>
<head>
${combinedHead}
</head>
<body>
${combinedBody}
</body>
</html>`;

    const newWin = window.open('', '_blank');
    if (newWin) {
        newWin.document.open();
        newWin.document.write(finalHtml);
        newWin.document.close();
        newWin.document.title = 'Consolidated VA&PT Report: ' + companyName;
    } else {
        alert("Please allow popups to view the consolidated report.");
    }
};
