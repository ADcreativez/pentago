import re

with open('templates/index.html', 'r') as f:
    html = f.read()

html_chunk = """                <!-- Used Tools & Threat Model Preview Cards (Displayed above Kesimpulan/Summary) -->
                <div id="project-tools-preview-card" class="sysreptor-report-card" style="margin-top: 2rem; display: none;">
                    <div class="sysreptor-report-title">
                        <span>Tools yang Digunakan (Used Tools)</span>
                        <button class="btn-helper" id="btn-copy-tools" onclick="copyToolsToClipboard()" style="background: transparent; color: var(--accent-blue); border: 1px solid rgba(15, 98, 254, 0.2); border-radius: 6px; padding: 0.25rem 0.75rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: all 0.2s;">
                            📋 Copy Tools
                        </button>
                    </div>
                    <div class="sysreptor-content" id="project-tools-preview-content" style="padding: 1.5rem; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; line-height: 1.6;">
                        <!-- List of tools -->
                    </div>
                </div>"""

if html_chunk in html:
    html = html.replace(html_chunk, "                <!-- Tools Preview Card removed as it is covered in 2.2 -->")
else:
    print("Could not find html_chunk")

with open('templates/index.html', 'w') as f:
    f.write(html)

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

js_chunk = """    // Render Used Tools Preview Card
    const toolsCard = document.getElementById('project-tools-preview-card');
    const toolsContent = document.getElementById('project-tools-preview-content');
    if (p.used_tools) {
        toolsCard.style.display = 'block';
        const toolsList = p.used_tools.split(',').map(t => t.trim()).filter(Boolean);
        if (toolsList.length > 0) {
            let listHtml = `<ul style="margin: 0; padding-left: 1.5rem; color: var(--text-primary); font-size: 0.95rem; line-height: 1.8;">`;
            toolsList.forEach(t => {
                listHtml += `<li style="margin-bottom: 0.25rem;">${t}</li>`;
            });
            listHtml += `</ul>`;
            toolsContent.innerHTML = listHtml;
        } else {
            toolsContent.innerHTML = '<span style="color: var(--text-secondary); font-style: italic;">No tools specified.</span>';
        }
    } else {
        toolsCard.style.display = 'none';
    }"""

if js_chunk in appjs:
    appjs = appjs.replace(js_chunk, "")
else:
    print("Could not find js_chunk")

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
