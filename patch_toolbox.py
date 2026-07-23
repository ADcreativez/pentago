import sys

# 1. Update workspace.html
with open('templates/workspace.html', 'r') as f:
    content = f.read()

old_kc = """                        <div id="attack-icons-section">
                            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.25rem 0;">
                            <h4 style="font-family: var(--font-title); margin: 0; font-size: 0.9rem; color: var(--text-primary);">Kill Chain Steps</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_recon')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>👁️ Recon</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_initial')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>🚪 Initial</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_exec')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>⚡ Exec</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_persist')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>⚓ Persist</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_privesc')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>🔼 PrivEsc</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_evasion')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>🛡️ Evade</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_cred')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>🔑 Creds</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_disc')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>🔍 Discover</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_collect')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>📦 Collect</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('kc_c2')" style="justify-content: center; padding: 0.5rem; font-size: 0.75rem; border-radius: 6px;">
                                    <span>📡 C2</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('text')" style="justify-content: center; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px; grid-column: span 2;">
                                    <span>📝 Text Label</span>
                                </button>
                            </div>
                        </div>"""

new_kc = """                        <div id="attack-icons-section">
                            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.25rem 0;">
                            <h4 style="font-family: var(--font-title); margin: 0; font-size: 0.9rem; color: var(--text-primary);">Techniques & Tactics</h4>
                            <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-top: 1rem;">
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_goal')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🚩 Assessment Goal</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_vuln')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🔍 Vulnerability Scan</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_phish')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🎣 Phishing</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_driveby')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🖥️ Drive-by Compromise</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_wmi')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🛠️ WMI / Scripting</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_inject')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>💉 Process Injection</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_evade')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🛡️ Defense Evasion</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_cred')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>🔑 Credential Access</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_c2')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>📡 Command & Control</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_generic')" style="justify-content: flex-start; padding: 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                    <span>📝 Custom Technique</span>
                                </button>
                            </div>
                        </div>"""
content = content.replace(old_kc, new_kc)

with open('templates/workspace.html', 'w') as f:
    f.write(content)

# 2. Update app.js
with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# Replace sizes for tech_ nodes
old_sizes = """    } else if (type === 'kc_recon') {
        label = "Reconnaissance";
        width = 120;
        height = 50;
    } else if (type === 'kc_initial') {
        label = "Initial Access";
        width = 120;
        height = 50;
    } else if (type === 'kc_exec') {
        label = "Execution";
        width = 120;
        height = 50;
    } else if (type === 'kc_persist') {
        label = "Persistence";
        width = 120;
        height = 50;
    } else if (type === 'kc_privesc') {
        label = "PrivEsc";
        width = 120;
        height = 50;
    } else if (type === 'kc_evasion') {
        label = "Defense Evasion";
        width = 120;
        height = 50;
    } else if (type === 'kc_cred') {
        label = "Credential Access";
        width = 120;
        height = 50;
    } else if (type === 'kc_disc') {
        label = "Discovery";
        width = 120;
        height = 50;
    } else if (type === 'kc_collect') {
        label = "Collection";
        width = 120;
        height = 50;
    } else if (type === 'kc_c2') {
        label = "Command & Control";
        width = 120;
        height = 50;
    }"""

new_sizes = """    } else if (type.startsWith('tech_')) {
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
appjs = appjs.replace(old_sizes, new_sizes)

# Render logic
old_render1 = """        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'kc_recon', 'kc_initial', 'kc_exec', 'kc_persist', 'kc_privesc', 'kc_evasion', 'kc_cred', 'kc_disc', 'kc_collect', 'kc_c2'].includes(node.type)) {"""
new_render1 = """        } else if (['user', 'server', 'device', 'cloud', 'attacker', 'virus', 'switch', 'router', 'database', 'firewall', 'tech_goal', 'tech_vuln', 'tech_phish', 'tech_driveby', 'tech_wmi', 'tech_inject', 'tech_evade', 'tech_cred', 'tech_c2', 'tech_generic'].includes(node.type)) {"""

old_render2 = """            else if (node.type === 'kc_recon') emoji = '👁️';
            else if (node.type === 'kc_initial') emoji = '🚪';
            else if (node.type === 'kc_exec') emoji = '⚡';
            else if (node.type === 'kc_persist') emoji = '⚓';
            else if (node.type === 'kc_privesc') emoji = '🔼';
            else if (node.type === 'kc_evasion') emoji = '🛡️';
            else if (node.type === 'kc_cred') emoji = '🔑';
            else if (node.type === 'kc_disc') emoji = '🔍';
            else if (node.type === 'kc_collect') emoji = '📦';
            else if (node.type === 'kc_c2') emoji = '📡';"""

new_render2 = """            else if (node.type === 'tech_goal') emoji = '🚩';
            else if (node.type === 'tech_vuln') emoji = '🔍';
            else if (node.type === 'tech_phish') emoji = '🎣';
            else if (node.type === 'tech_driveby') emoji = '🖥️';
            else if (node.type === 'tech_wmi') emoji = '🛠️';
            else if (node.type === 'tech_inject') emoji = '💉';
            else if (node.type === 'tech_evade') emoji = '🛡️';
            else if (node.type === 'tech_cred') emoji = '🔑';
            else if (node.type === 'tech_c2') emoji = '📡';
            else if (node.type === 'tech_generic') emoji = '📝';"""

old_render3 = """            if (node.type.startsWith('kc_')) {
                studioCtx.font = '16px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'center';
                studioCtx.textBaseline = 'middle';
                studioCtx.fillText(emoji, node.x + 20, node.y + node.height / 2);
                
                studioCtx.fillStyle = '#0f172a';
                studioCtx.font = '11px Inter, Roboto, Arial, sans-serif';
                studioCtx.textAlign = 'left';
                studioCtx.fillText(node.label, node.x + 35, node.y + node.height / 2);
            }"""

new_render3 = """            if (node.type.startsWith('tech_')) {
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

appjs = appjs.replace(old_render1, new_render1)
appjs = appjs.replace(old_render2, new_render2)
appjs = appjs.replace(old_render3, new_render3)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)

print("Patch applied.")
