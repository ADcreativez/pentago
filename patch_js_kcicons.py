import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# 1. Admin UI Logic
admin_logic = """
// --- Kill Chain Icons Config ---
let killChainIconsConfig = [];

async function loadKCIconsConfig() {
    try {
        const res = await fetch('/api/settings');
        if (res.ok) {
            const data = await res.json();
            if (data.killchain_icons) {
                killChainIconsConfig = JSON.parse(data.killchain_icons);
            } else {
                // Default
                killChainIconsConfig = [
                    { id: 'tech_goal', emoji: '🚩', label: 'Assessment Goal' },
                    { id: 'tech_vuln', emoji: '🔍', label: 'Vulnerability Scan' },
                    { id: 'tech_phish', emoji: '🎣', label: 'Phishing' },
                    { id: 'tech_driveby', emoji: '🖥️', label: 'Drive-by Compromise' },
                    { id: 'tech_wmi', emoji: '🛠️', label: 'WMI / Scripting' },
                    { id: 'tech_inject', emoji: '💉', label: 'Process Injection' },
                    { id: 'tech_evade', emoji: '🛡️', label: 'Defense Evasion' },
                    { id: 'tech_cred', emoji: '🔑', label: 'Credential Access' },
                    { id: 'tech_c2', emoji: '📡', label: 'Command & Control' }
                ];
            }
            renderKCIconsTable();
        }
    } catch (e) { console.error(e); }
}

function renderKCIconsTable() {
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
}

function addKCIconRow() {
    killChainIconsConfig.push({ id: 'tech_custom_' + Date.now(), emoji: '❓', label: 'New Technique' });
    renderKCIconsTable();
}

function deleteKCIconRow(index) {
    killChainIconsConfig.splice(index, 1);
    renderKCIconsTable();
}

async function saveKCIcons() {
    const tbody = document.getElementById('kcicons-table-body');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    
    let newConfig = [];
    rows.forEach((row, index) => {
        const emoji = row.querySelector('.kc-emoji-input').value;
        const label = row.querySelector('.kc-label-input').value;
        const existingId = killChainIconsConfig[index] ? killChainIconsConfig[index].id : 'tech_custom_' + Date.now() + Math.random().toString().substr(2,5);
        newConfig.push({ id: existingId, emoji: emoji, label: label });
    });
    
    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ killchain_icons: JSON.stringify(newConfig) })
        });
        if (res.ok) {
            alert('Kill Chain Icons saved successfully!');
            killChainIconsConfig = newConfig;
        } else {
            alert('Failed to save config.');
        }
    } catch (e) { console.error(e); alert('Error saving config.'); }
}
"""

if "function loadKCIconsConfig" not in appjs:
    appjs += admin_logic


# 2. Hook switchConfigSubTab to handle kcicons tab and call loadKCIconsConfig
old_switch = """function switchConfigSubTab(tabId) {
    document.querySelectorAll('.config-sub-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.config-tab-btn').forEach(el => {"""
new_switch = """function switchConfigSubTab(tabId) {
    if (tabId === 'kcicons') loadKCIconsConfig();
    document.querySelectorAll('.config-sub-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.config-tab-btn').forEach(el => {"""
if "if (tabId === 'kcicons') loadKCIconsConfig();" not in appjs:
    appjs = appjs.replace(old_switch, new_switch)


with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js admin patched")
