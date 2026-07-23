with open('static/js/app.js', 'r') as f:
    content = f.read()

js_code = """
// --- System Configuration Logic ---
function openSystemConfigModal() {
    closeProfileDropdown();
    if (!currentUser || currentUser.role !== 'Admin') {
        alert("Unauthorized: Only Admin can access System Config");
        return;
    }
    
    // Fetch current settings
    fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
            if (data.gemini_api_key) {
                document.getElementById('config-gemini-key').value = data.gemini_api_key;
            } else {
                document.getElementById('config-gemini-key').value = '';
            }
            document.getElementById('system-config-modal').style.display = 'flex';
        })
        .catch(err => {
            console.error("Failed to load settings", err);
            alert("Failed to load system settings.");
        });
}

function closeSystemConfigModal() {
    document.getElementById('system-config-modal').style.display = 'none';
}

function saveSystemConfig(event) {
    event.preventDefault();
    if (!currentUser || currentUser.role !== 'Admin') return;
    
    const apiKey = document.getElementById('config-gemini-key').value.trim();
    
    const btn = document.getElementById('btn-save-sysconfig');
    const oldText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini_api_key: apiKey })
    })
    .then(res => res.json())
    .then(data => {
        alert("System configuration saved successfully.");
        closeSystemConfigModal();
    })
    .catch(err => {
        console.error(err);
        alert("Error saving configuration.");
    })
    .finally(() => {
        btn.innerHTML = oldText;
        btn.disabled = false;
    });
}
"""

if 'openSystemConfigModal' not in content:
    with open('static/js/app.js', 'a') as f:
        f.write("\n" + js_code)
    print("Added config JS functions")
else:
    print("Config JS functions already exist")
