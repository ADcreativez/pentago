with open('static/js/app.js', 'r') as f:
    content = f.read()

# I will replace the translation block inside openReportPreview
target_old = """
            previewHtml = _buildPreviewDocument(p, findings, null, structure, lang === 'en' ? 'id' : lang, false, spacingMode);
            
            if (lang === 'en') {
                const loadingOverlay = document.createElement('div');
                loadingOverlay.style.position = 'fixed';
                loadingOverlay.style.top = '0';
                loadingOverlay.style.left = '0';
                loadingOverlay.style.width = '100vw';
                loadingOverlay.style.height = '100vh';
                loadingOverlay.style.backgroundColor = 'rgba(255,255,255,0.9)';
                loadingOverlay.style.zIndex = '999999';
                loadingOverlay.style.display = 'flex';
                loadingOverlay.style.flexDirection = 'column';
                loadingOverlay.style.alignItems = 'center';
                loadingOverlay.style.justifyContent = 'center';
                loadingOverlay.innerHTML = '<div class="spinner" style="width:50px;height:50px;border:5px solid #ccc;border-top-color:#1e3a5f;border-radius:50%;animation:spin 1s linear infinite;"></div><h2 style="margin-top:20px;color:#1e3a5f;">Translating with AI...</h2><p>Please wait, translating full document to English.</p><style>@keyframes spin { 100% { transform:rotate(360deg); } }</style>';
                document.body.appendChild(loadingOverlay);
                
                try {
                    const resp = await fetch('/api/translate_html', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ html: previewHtml })
                    });
                    const resData = await resp.json();
                    if (resData.translated) {
                        previewHtml = resData.translated;
                    } else {
                        if (resData.error) console.warn("AI Translation failed, falling back to local translation: " + resData.error);
                        previewHtml = _buildPreviewDocument(p, findings, null, structure, 'en', false, spacingMode);
                    }
                } catch(e) {
                    console.error("Translation API failed:", e);
                    previewHtml = _buildPreviewDocument(p, findings, null, structure, 'en', false, spacingMode);
                } finally {
                    document.body.removeChild(loadingOverlay);
                }
            }
"""

replacement_new = """
            if (lang === 'en') {
                const loadingOverlay = document.createElement('div');
                loadingOverlay.style.position = 'fixed';
                loadingOverlay.style.top = '0';
                loadingOverlay.style.left = '0';
                loadingOverlay.style.width = '100vw';
                loadingOverlay.style.height = '100vh';
                loadingOverlay.style.backgroundColor = 'rgba(255,255,255,0.9)';
                loadingOverlay.style.zIndex = '999999';
                loadingOverlay.style.display = 'flex';
                loadingOverlay.style.flexDirection = 'column';
                loadingOverlay.style.alignItems = 'center';
                loadingOverlay.style.justifyContent = 'center';
                loadingOverlay.innerHTML = '<div class="spinner" style="width:50px;height:50px;border:5px solid #ccc;border-top-color:#1e3a5f;border-radius:50%;animation:spin 1s linear infinite;"></div><h2 style="margin-top:20px;color:#1e3a5f;">Translating with AI...</h2><p>Please wait, translating full document to English.</p><style>@keyframes spin { 100% { transform:rotate(360deg); } }</style>';
                document.body.appendChild(loadingOverlay);
                
                try {
                    const resp = await fetch('/api/translate_report_data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ project: p, findings: findings, structure: structure })
                    });
                    const resData = await resp.json();
                    if (resData.error) {
                        console.warn("AI Translation failed, falling back to local translation: " + resData.error);
                        previewHtml = _buildPreviewDocument(p, findings, null, structure, 'en', false, spacingMode);
                    } else {
                        // Success! Build the preview using the translated data directly.
                        // We pass 'id' here to prevent _buildPreviewDocument from triggering the local dictionary fallback again,
                        // since the data is ALREADY in English now!
                        previewHtml = _buildPreviewDocument(resData.project, resData.findings, null, resData.structure, 'id', false, spacingMode);
                    }
                } catch(e) {
                    console.error("Translation API failed:", e);
                    previewHtml = _buildPreviewDocument(p, findings, null, structure, 'en', false, spacingMode);
                } finally {
                    document.body.removeChild(loadingOverlay);
                }
            } else {
                previewHtml = _buildPreviewDocument(p, findings, null, structure, lang, false, spacingMode);
            }
"""

if "fetch('/api/translate_html'" in content:
    content = content.replace(target_old.strip(), replacement_new.strip())
    with open('static/js/app.js', 'w') as f:
        f.write(content)
    print("Replaced app.js translation logic")
else:
    print("Could not find exact block in app.js, checking...")
