import sys

# 1. Update app.py to add the download route
with open('app.py', 'r') as f:
    app_py = f.read()

download_route = """
@app.route('/api/settings/download_icon', methods=['POST'])
@login_required
@admin_required
def download_icon():
    import requests
    import os
    import uuid
    from urllib.parse import urlparse
    
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
        
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Determine extension
        content_type = response.headers.get('content-type', '')
        ext = '.png'
        if 'jpeg' in content_type or 'jpg' in content_type:
            ext = '.jpg'
        elif 'svg' in content_type:
            ext = '.svg'
        elif 'gif' in content_type:
            ext = '.gif'
            
        filename = f"icon_{uuid.uuid4().hex[:8]}{ext}"
        save_dir = os.path.join(app.root_path, 'static', 'uploads', 'icons')
        os.makedirs(save_dir, exist_ok=True)
        
        filepath = os.path.join(save_dir, filename)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        local_url = f"/static/uploads/icons/{filename}"
        return jsonify({'local_url': local_url})
    except Exception as e:
        print("Error downloading icon:", e)
        return jsonify({'error': str(e)}), 500
"""

if "/api/settings/download_icon" not in app_py:
    # Insert before API Settings
    app_py = app_py.replace("@app.route('/api/settings'", download_route + "\n@app.route('/api/settings'")
    with open('app.py', 'w') as f:
        f.write(app_py)
    print("app.py updated")


# 2. Update app.js admin logic to handle URL pasting
with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# Replace renderKCIconsTable to support image preview and onchange handler for URL download
old_render_admin = """function renderKCIconsTable() {
    const tbody = document.getElementById('kcicons-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    killChainIconsConfig.forEach((icon, index) => {
        tbody.innerHTML += `
            <tr>
                <td><input type="text" class="kc-emoji-input" value="${icon.emoji}" style="width:100%; text-align:center; padding:0.4rem; font-size:1.2rem; border:1px solid #ccc; border-radius:4px;"></td>
                <td><input type="text" class="kc-label-input" value="${icon.label}" style="width:100%; padding:0.4rem; border:1px solid #ccc; border-radius:4px;"></td>
                <td><button class="btn btn-danger" onclick="deleteKCIconRow(${index})">Delete</button></td>
            </tr>
        `;
    });
}"""

new_render_admin = """
async function handleIconInputBlur(input, index) {
    const val = input.value.trim();
    if (val.startsWith('http://') || val.startsWith('https://')) {
        input.value = 'Downloading...';
        try {
            const res = await fetch('/api/settings/download_icon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: val })
            });
            const data = await res.json();
            if (res.ok && data.local_url) {
                killChainIconsConfig[index].emoji = data.local_url;
                renderKCIconsTable();
            } else {
                alert('Gagal mendownload gambar: ' + (data.error || 'Unknown error'));
                input.value = val;
            }
        } catch (e) {
            console.error(e);
            alert('Error downloading image');
            input.value = val;
        }
    } else {
        killChainIconsConfig[index].emoji = val;
        renderKCIconsTable();
    }
}

function renderKCIconsTable() {
    const tbody = document.getElementById('kcicons-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    killChainIconsConfig.forEach((icon, index) => {
        let displayHtml = '';
        if (icon.emoji.startsWith('/') || icon.emoji.startsWith('http')) {
            displayHtml = `<img src="${icon.emoji}" style="max-width:32px; max-height:32px; object-fit:contain; border-radius:4px;" />`;
        } else {
            displayHtml = `<span style="font-size:1.5rem;">${icon.emoji}</span>`;
        }
        
        tbody.innerHTML += `
            <tr>
                <td style="text-align:center;">
                    <div style="margin-bottom:0.5rem; min-height:36px; display:flex; align-items:center; justify-content:center;">
                        ${displayHtml}
                    </div>
                    <input type="text" class="kc-emoji-input" placeholder="Emoji or URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="width:100%; text-align:center; padding:0.4rem; font-size:0.85rem; border:1px solid #ccc; border-radius:4px;">
                </td>
                <td><input type="text" class="kc-label-input" value="${icon.label}" onchange="killChainIconsConfig[${index}].label = this.value" style="width:100%; padding:0.4rem; border:1px solid #ccc; border-radius:4px;"></td>
                <td><button class="btn btn-danger" onclick="deleteKCIconRow(${index})">Delete</button></td>
            </tr>
        `;
    });
}"""

if "function handleIconInputBlur" not in appjs:
    appjs = appjs.replace(old_render_admin, new_render_admin)


# 3. Update app.js Workspace rendering logic to handle images instead of emojis
# renderWorkspaceKCIcons
old_render_workspace = """        html += `
            <button type="button" class="btn btn-secondary" onclick="addStudioElement('${icon.id}')" title="${icon.label}" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                <span>${icon.emoji}</span>
            </button>
        `;"""
new_render_workspace = """        let iconHtml = `<span>${icon.emoji}</span>`;
        if (icon.emoji.startsWith('/') || icon.emoji.startsWith('http')) {
            iconHtml = `<img src="${icon.emoji}" style="max-width:24px; max-height:24px; object-fit:contain;" />`;
        }
        html += `
            <button type="button" class="btn btn-secondary" onclick="addStudioElement('${icon.id}')" title="${icon.label}" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                ${iconHtml}
            </button>
        `;"""
if "let iconHtml =" not in appjs:
    appjs = appjs.replace(old_render_workspace, new_render_workspace)

# 4. Canvas Drawing logic
old_canvas_draw = """            if (node.type.startsWith('tech_')) {
                // Remove white background and border to look like raw text + icon, like the image
                studioCtx.clearRect(node.x, node.y, node.width, node.height);
                studioCtx.fillStyle = '#fafafa';
                studioCtx.fillRect(node.x, node.y, node.width, node.height);
                
                // Light outline so it's selectable, but mostly looks transparent
                studioCtx.strokeStyle = 'rgba(0,0,0,0.05)';
                studioCtx.lineWidth = 1;
                studioCtx.strokeRect(node.x, node.y, node.width, node.height);
                
                studioCtx.font = '16px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'center';
                studioCtx.textBaseline = 'middle';
                studioCtx.fillText(emoji, node.x + 15, node.y + node.height / 2);
                
                studioCtx.fillStyle = '#334155';
                studioCtx.font = '11px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'left';
                // Wrap text if needed or just draw
                studioCtx.fillText(node.label, node.x + 30, node.y + node.height / 2);
            }"""

new_canvas_draw = """            if (node.type.startsWith('tech_')) {
                studioCtx.clearRect(node.x, node.y, node.width, node.height);
                studioCtx.fillStyle = '#fafafa';
                studioCtx.fillRect(node.x, node.y, node.width, node.height);
                
                studioCtx.strokeStyle = 'rgba(0,0,0,0.05)';
                studioCtx.lineWidth = 1;
                studioCtx.strokeRect(node.x, node.y, node.width, node.height);
                
                if (emoji.startsWith('/') || emoji.startsWith('http')) {
                    // Try to load image
                    if (!node.imgObj) {
                        const img = new Image();
                        img.src = emoji;
                        img.onload = () => { node.imgObj = img; renderStudioDiagram(); };
                        node.imgObj = "loading";
                    } else if (node.imgObj !== "loading") {
                        studioCtx.drawImage(node.imgObj, node.x + 5, node.y + (node.height/2) - 10, 20, 20);
                    }
                } else {
                    studioCtx.font = '16px Inter, Roboto, Arial, sans-serif';
                    studioCtx.textAlign = 'center';
                    studioCtx.textBaseline = 'middle';
                    studioCtx.fillText(emoji, node.x + 15, node.y + node.height / 2);
                }
                
                studioCtx.fillStyle = '#334155';
                studioCtx.font = '11px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'left';
                studioCtx.textBaseline = 'middle';
                studioCtx.fillText(node.label, node.x + 30, node.y + node.height / 2);
            }"""
if "if (emoji.startsWith('/') || emoji.startsWith('http')) {" not in appjs:
    appjs = appjs.replace(old_canvas_draw, new_canvas_draw)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js updated")

