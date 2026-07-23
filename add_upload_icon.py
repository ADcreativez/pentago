import sys

# 1. Update app.py
with open('app.py', 'r') as f:
    app_py = f.read()

upload_route = """
@app.route('/api/settings/upload_icon', methods=['POST'])
@login_required
@admin_required
def upload_icon():
    import os
    import uuid
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg', '.gif', '.svg']:
            return jsonify({'error': 'Invalid file type'}), 400
            
        new_filename = f"icon_{uuid.uuid4().hex[:8]}{ext}"
        save_dir = os.path.join(app.root_path, 'static', 'uploads', 'icons')
        os.makedirs(save_dir, exist_ok=True)
        
        filepath = os.path.join(save_dir, new_filename)
        file.save(filepath)
        
        local_url = f"/static/uploads/icons/{new_filename}"
        return jsonify({'local_url': local_url})
"""

if "/api/settings/upload_icon" not in app_py:
    app_py = app_py.replace("@app.route('/api/settings/download_icon'", upload_route + "\n@app.route('/api/settings/download_icon'")
    with open('app.py', 'w') as f:
        f.write(app_py)
    print("app.py updated with upload route")


# 2. Update app.js
with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# Add the upload file logic
upload_js_logic = """
async function handleIconFileUpload(fileInput, index) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const res = await fetch('/api/settings/upload_icon', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok && data.local_url) {
            killChainIconsConfig[index].emoji = data.local_url;
            renderKCIconsTable();
        } else {
            alert('Gagal mengupload gambar: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        console.error(e);
        alert('Error uploading image');
    }
}
"""

if "function handleIconFileUpload" not in appjs:
    appjs = appjs.replace("async function handleIconInputBlur", upload_js_logic + "\nasync function handleIconInputBlur")


old_render = """                    <input type="text" class="kc-emoji-input" placeholder="Emoji or URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="width:100%; text-align:center; padding:0.4rem; font-size:0.85rem; border:1px solid #ccc; border-radius:4px;">
                </td>"""
new_render = """                    <div style="display:flex; gap:0.25rem;">
                        <input type="text" class="kc-emoji-input" placeholder="Emoji or URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="flex:1; text-align:center; padding:0.4rem; font-size:0.85rem; border:1px solid #ccc; border-radius:4px;">
                        <label class="btn btn-secondary" style="margin:0; padding:0.4rem; cursor:pointer; border-radius:4px;" title="Upload File Lokal">
                            📁
                            <input type="file" style="display:none;" accept="image/png, image/jpeg, image/gif, image/svg+xml" onchange="handleIconFileUpload(this, ${index})">
                        </label>
                    </div>
                </td>"""

if 'title="Upload File Lokal"' not in appjs:
    appjs = appjs.replace(old_render, new_render)
    with open('static/js/app.js', 'w') as f:
        f.write(appjs)
    print("app.js updated with upload UI")

