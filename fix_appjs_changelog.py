import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

new_logic = """
// ==========================================
// System Changelog Logic
// ==========================================

async function loadGitLogs() {
    const tbody = document.getElementById('git-log-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading logs...</td></tr>';
    try {
        const res = await fetch('/api/admin/changelogs');
        const data = await res.json();
        tbody.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach((log, index) => {
                const actionHtml = `<button class="btn btn-action-delete" onclick="deleteChangelog(${log.id})" style="padding:0;width:28px;height:28px;" title="Delete Log">&times;</button>`;
                tbody.innerHTML += `
                    <tr>
                        <td style="font-family:monospace;font-weight:600;">v${log.version}</td>
                        <td>${log.date}</td>
                        <td>${log.description}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada catatan log pembaruan.</td></tr>';
        }
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red;">Failed to load logs.</td></tr>';
    }
}

async function saveChangelog() {
    const verInput = document.getElementById('changelog-version-input');
    const descInput = document.getElementById('changelog-desc-input');
    const version = verInput.value.trim();
    const description = descInput.value.trim();
    
    if (!version || !description) {
        alert('Harap isi versi dan deskripsi pembaruan.');
        return;
    }
    
    try {
        const res = await fetch('/api/admin/changelogs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ version, description })
        });
        if (res.ok) {
            verInput.value = '';
            descInput.value = '';
            loadGitLogs();
        } else {
            alert('Gagal menyimpan log.');
        }
    } catch(e) {
        alert('Error: ' + e.message);
    }
}

async function deleteChangelog(id) {
    if (!confirm('Hapus log pencatatan ini?')) return;
    try {
        const res = await fetch(`/api/admin/changelogs/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadGitLogs();
        } else {
            alert('Gagal menghapus log.');
        }
    } catch(e) {
        alert('Error: ' + e.message);
    }
}
"""

content = re.sub(r'// ==========================================\n// App Version Control Logic.*?async function restoreAppVersion\(hash\) \{.*?\n\}', new_logic, content, flags=re.DOTALL)

with open('static/js/app.js', 'w') as f:
    f.write(content)
