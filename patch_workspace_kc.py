import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# 1. Add workspace logic for fetching and rendering dynamic tools
workspace_logic = """
let workspaceKCIcons = [];
let defaultWorkspaceKCIcons = [
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

async function loadWorkspaceKCIcons() {
    try {
        const res = await fetch('/api/settings');
        if (res.ok) {
            const data = await res.json();
            if (data.killchain_icons) {
                workspaceKCIcons = JSON.parse(data.killchain_icons);
            } else {
                workspaceKCIcons = defaultWorkspaceKCIcons;
            }
        }
    } catch (e) { 
        console.error(e); 
        workspaceKCIcons = defaultWorkspaceKCIcons;
    }
    renderWorkspaceKCIcons();
}

function renderWorkspaceKCIcons() {
    const section = document.getElementById('attack-icons-section');
    if (!section) return;
    
    // Check if the container exists
    let grid = section.querySelector('.grid-container');
    if (!grid) {
        section.innerHTML = `
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.25rem 0;">
            <h4 style="font-family: var(--font-title); margin: 0; font-size: 0.9rem; color: var(--text-primary);">Techniques</h4>
            <div class="grid-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem;"></div>
        `;
        grid = section.querySelector('.grid-container');
    }
    
    let html = '';
    workspaceKCIcons.forEach(icon => {
        html += `
            <button type="button" class="btn btn-secondary" onclick="addStudioElement('${icon.id}')" title="${icon.label}" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                <span>${icon.emoji}</span>
            </button>
        `;
    });
    
    // Always append Custom Technique at the bottom
    html += `
        <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_generic')" title="Custom Technique" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px; grid-column: span 3;">
            <span>📝 Custom Technique</span>
        </button>
    `;
    
    grid.innerHTML = html;
}
"""
if "function loadWorkspaceKCIcons" not in appjs:
    appjs += workspace_logic


# 2. Hook loadWorkspaceKCIcons in openThreatModelStudio so it runs right before showing canvas
old_open = """function openThreatModelStudio(diagramId, name, type = 'threat') {"""
new_open = """function openThreatModelStudio(diagramId, name, type = 'threat') {
    if (type === 'killchain') {
        loadWorkspaceKCIcons();
    }"""
if "if (type === 'killchain') {" not in appjs.split("function openThreatModelStudio(diagramId, name, type = 'threat') {")[1][:100]:
    appjs = appjs.replace(old_open, new_open)


# 3. Patch addStudioElement and renderStudioDiagram to use dynamic workspaceKCIcons
old_add_sizes = """    } else if (type.startsWith('tech_')) {
        width = 180;
        height = 40;
        if (type === 'tech_goal') label = "Assessment Goal";
        else if (type === 'tech_vuln') label = "Vulnerability Scan";
        else if (type === 'tech_phish') label = "Phishing";
        else if (type === 'tech_driveby') label = "Drive-by Compromise";
        else if (type === 'tech_wmi') label = "WMI / Scripting";
        else if (type === 'tech_inject') label = "Process Injection";
        else if (type === 'tech_evade') label = "Defense Evasion";
        else if (type === 'tech_cred') label = "Credential Access";
        else if (type === 'tech_c2') label = "Command & Control";
        else if (type === 'tech_generic') label = "Custom Technique";
    }"""
new_add_sizes = """    } else if (type.startsWith('tech_')) {
        width = 180;
        height = 40;
        if (type === 'tech_generic') {
            label = "Custom Technique";
        } else {
            const found = workspaceKCIcons.find(i => i.id === type);
            if (found) label = found.label;
            else label = "Unknown Technique";
        }
    }"""
if "workspaceKCIcons.find" not in appjs:
    appjs = appjs.replace(old_add_sizes, new_add_sizes)

# 4. Patch render includes()
old_render_inc = """} else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'tech_goal', 'tech_vuln', 'tech_phish', 'tech_driveby', 'tech_wmi', 'tech_inject', 'tech_evade', 'tech_cred', 'tech_c2', 'tech_generic'].includes(node.type)) {"""
new_render_inc = """} else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'tech_generic'].includes(node.type) || node.type.startsWith('tech_')) {"""
if "|| node.type.startsWith('tech_')" not in appjs:
    appjs = appjs.replace(old_render_inc, new_render_inc)

# 5. Patch render emoji selection
old_render_emoji = """            else if (node.type === 'tech_goal') emoji = '🚩';
            else if (node.type === 'tech_vuln') emoji = '🔍';
            else if (node.type === 'tech_phish') emoji = '🎣';
            else if (node.type === 'tech_driveby') emoji = '🖥️';
            else if (node.type === 'tech_wmi') emoji = '🛠️';
            else if (node.type === 'tech_inject') emoji = '💉';
            else if (node.type === 'tech_evade') emoji = '🛡️';
            else if (node.type === 'tech_cred') emoji = '🔑';
            else if (node.type === 'tech_c2') emoji = '📡';
            else if (node.type === 'tech_generic') emoji = '📝';"""
new_render_emoji = """            else if (node.type === 'tech_generic') emoji = '📝';
            else if (node.type.startsWith('tech_')) {
                const found = workspaceKCIcons.find(i => i.id === node.type);
                if (found) emoji = found.emoji;
                else emoji = '❓';
            }"""
if "const found = workspaceKCIcons.find" not in appjs.split("else if (node.type === 'tech_generic')")[1]:
    appjs = appjs.replace(old_render_emoji, new_render_emoji)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js workspace patched")
