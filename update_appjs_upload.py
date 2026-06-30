import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

html_find = """                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Cover Logo URL</label>
                        <input type="text" id="cover-logo-input" class="form-control" value="${p.cover_logo || ''}" placeholder="https://...">
                    </div>
                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Client Logo URL</label>
                        <input type="text" id="client-logo-input" class="form-control" value="${p.client_logo || ''}" placeholder="https://...">
                    </div>"""

html_replace = """                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Cover Logo</label>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <input type="file" id="cover-logo-file" class="form-control" accept="image/*" onchange="handleLogoUpload(this, 'cover-logo-input', 'cover-logo-preview')" style="font-size: 0.8rem;">
                            <input type="hidden" id="cover-logo-input" value="${p.cover_logo || ''}">
                            <img id="cover-logo-preview" src="${p.cover_logo || ''}" style="max-height:35px; max-width:100px; display:${p.cover_logo ? 'block' : 'none'}; object-fit:contain; border:1px solid #e2e8f0; border-radius:4px; padding:2px;">
                        </div>
                    </div>
                    <div>
                        <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Client Logo</label>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <input type="file" id="client-logo-file" class="form-control" accept="image/*" onchange="handleLogoUpload(this, 'client-logo-input', 'client-logo-preview')" style="font-size: 0.8rem;">
                            <input type="hidden" id="client-logo-input" value="${p.client_logo || ''}">
                            <img id="client-logo-preview" src="${p.client_logo || ''}" style="max-height:35px; max-width:100px; display:${p.client_logo ? 'block' : 'none'}; object-fit:contain; border:1px solid #e2e8f0; border-radius:4px; padding:2px;">
                        </div>
                    </div>"""

if html_find in content:
    content = content.replace(html_find, html_replace)
else:
    print("Could not find HTML to replace")

# Add the handleLogoUpload function
func_add = """window.handleLogoUpload = function(inputEl, hiddenInputId, previewImgId) {
    if (inputEl.files && inputEl.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(hiddenInputId).value = e.target.result;
            const preview = document.getElementById(previewImgId);
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(inputEl.files[0]);
    }
};

window.saveAllEditors = async function() {"""

content = content.replace("window.saveAllEditors = async function() {", func_add)

with open('static/js/app.js', 'w') as f:
    f.write(content)

