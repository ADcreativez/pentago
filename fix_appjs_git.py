with open('static/js/app.js', 'r') as f:
    content = f.read()

js_logic = """
// ==========================================
// App Version Control Logic
// ==========================================

async function loadGitLogs() {
    const tbody = document.getElementById('git-log-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading logs...</td></tr>';
    try {
        const res = await fetch('/api/admin/git-log');
        const data = await res.json();
        tbody.innerHTML = '';
        if (data.logs && data.logs.length > 0) {
            data.logs.forEach((log, index) => {
                const isCurrent = index === 0;
                let actionHtml = '';
                if (isCurrent) {
                    actionHtml = '<span class="badge" style="background:#dcfce7;color:#166534;">Current State</span>';
                } else {
                    actionHtml = `<button class="btn btn-secondary" onclick="restoreAppVersion('${log.hash}')" style="font-size:0.75rem;padding:0.25rem 0.5rem;background:#fee2e2;color:#991b1b;border-color:#fca5a5;">⏪ Restore</button>`;
                }
                tbody.innerHTML += `
                    <tr ${isCurrent ? 'style="background:#f8fafc;"' : ''}>
                        <td style="font-family:monospace;font-weight:600;">${log.hash}</td>
                        <td>${log.date}</td>
                        <td>${log.author}</td>
                        <td>${log.message}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No history found.</td></tr>';
        }
        
        if (data.has_changes) {
            document.getElementById('commit-message-input').placeholder = "You have unsaved changes...";
        } else {
            document.getElementById('commit-message-input').placeholder = "Clean state (No changes)";
        }
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Failed to load logs.</td></tr>';
    }
}

async function commitCurrentVersion() {
    const msgInput = document.getElementById('commit-message-input');
    const msg = msgInput.value.trim();
    if (!msg) {
        alert('Please enter an update description (log message) before saving.');
        return;
    }
    
    try {
        const res = await fetch('/api/admin/git-commit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            msgInput.value = '';
            loadGitLogs();
        } else {
            alert('Error: ' + data.message);
        }
    } catch(e) {
        alert('Failed to save version: ' + e.message);
    }
}

async function restoreAppVersion(hash) {
    if (!confirm('Peringatan: Melakukan restore akan mengembalikan seluruh file aplikasi ke versi [' + hash + ']. Perubahan yang belum di-save (commit) akan HILANG SELAMANYA. Apakah Anda yakin ingin melanjutkan?')) {
        return;
    }
    
    try {
        const res = await fetch('/api/admin/git-restore', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ hash: hash })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Restore berhasil! Aplikasi mungkin akan me-restart secara otomatis. Halaman ini akan direfresh dalam 3 detik.');
            setTimeout(() => {
                window.location.reload(true);
            }, 3000);
        } else {
            alert('Error: ' + data.message);
        }
    } catch(e) {
        alert('Failed to restore version: ' + e.message);
    }
}
"""

content += "\n" + js_logic

# Make switchConfigSubTab trigger loadGitLogs
content = content.replace("        if (tabId === 'users') loadUsers();", 
                          "        if (tabId === 'users') loadUsers();\n        if (tabId === 'versions') loadGitLogs();")

with open('static/js/app.js', 'w') as f:
    f.write(content)
