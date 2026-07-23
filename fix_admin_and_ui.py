import sys

# 1. Fix admin.html script block
with open('templates/admin.html', 'r') as f:
    admin_content = f.read()

old_admin_end = """        
{% endblock %}

<script>
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        setTimeout(() => switchTab(tab), 100);
    } else {
        setTimeout(() => switchTab('config'), 100); // Default for admin
    }
});
</script>"""

new_admin_end = """
<script>
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        setTimeout(() => switchTab(tab), 100);
    } else {
        setTimeout(() => switchTab('config'), 100); // Default for admin
    }
});
</script>
        
{% endblock %}"""

if old_admin_end in admin_content:
    admin_content = admin_content.replace(old_admin_end, new_admin_end)
    with open('templates/admin.html', 'w') as f:
        f.write(admin_content)
    print("admin.html patched")
else:
    print("Could not find the script block in admin.html")


# 2. Fix app.js double icon rendering
with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_render = """        let displayHtml = '';
        if (icon.emoji.startsWith('/') || icon.emoji.startsWith('http')) {
            displayHtml = `<img src="${icon.emoji}" style="max-width:32px; max-height:32px; object-fit:contain; border-radius:4px;" />`;
        } else {
            displayHtml = `<span style="font-size:1.5rem;">${icon.emoji}</span>`;
        }
        
        tbody.innerHTML += `
            <tr>
                <td style="text-align:center; vertical-align:middle; padding: 0.75rem;">
                    <div style="margin-bottom:0.75rem; min-height:40px; display:flex; align-items:center; justify-content:center;">
                        ${displayHtml}
                    </div>
                    <div style="display:flex; gap:0.25rem;">
                        <input type="text" class="kc-emoji-input" placeholder="Emoji or URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="flex:1; text-align:center; padding:0.5rem; font-size:0.9rem; border:1px solid #ccc; border-radius:4px;">
                        <label class="btn btn-secondary" style="margin:0; padding:0.5rem 0.6rem; cursor:pointer; border-radius:4px; display:inline-flex; align-items:center;" title="Upload File Lokal">
                            📁
                            <input type="file" style="display:none;" accept="image/png, image/jpeg, image/gif, image/svg+xml" onchange="handleIconFileUpload(this, ${index})">
                        </label>
                    </div>
                </td>"""

new_render = """        let inputHtml = '';
        if (icon.emoji.startsWith('/') || icon.emoji.startsWith('http')) {
            inputHtml = `
                <div style="display:flex; align-items:center; gap:0.5rem; background:#f8fafc; border:1px solid #ccc; border-radius:4px; padding:0.25rem 0.5rem;">
                    <img src="${icon.emoji}" style="max-width:24px; max-height:24px; object-fit:contain; border-radius:2px;" />
                    <input type="text" class="kc-emoji-input" placeholder="URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="flex:1; border:none; background:transparent; font-size:0.8rem; outline:none;" title="${icon.emoji}">
                </div>
            `;
        } else {
            inputHtml = `<input type="text" class="kc-emoji-input" placeholder="Emoji / Paste URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="width:100%; text-align:center; padding:0.5rem; font-size:1.2rem; border:1px solid #ccc; border-radius:4px;">`;
        }
        
        tbody.innerHTML += `
            <tr>
                <td style="vertical-align:middle; padding: 0.75rem;">
                    <div style="display:flex; gap:0.25rem;">
                        <div style="flex:1;">
                            ${inputHtml}
                        </div>
                        <label class="btn btn-secondary" style="margin:0; padding:0.5rem 0.6rem; cursor:pointer; border-radius:4px; display:inline-flex; align-items:center;" title="Upload File Lokal">
                            📁
                            <input type="file" style="display:none;" accept="image/png, image/jpeg, image/gif, image/svg+xml" onchange="handleIconFileUpload(this, ${index})">
                        </label>
                    </div>
                </td>"""

if "let displayHtml = '';" in appjs:
    appjs = appjs.replace(old_render, new_render)
    with open('static/js/app.js', 'w') as f:
        f.write(appjs)
    print("app.js patched")
else:
    print("Could not find render block in app.js")

