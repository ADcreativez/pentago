import sys

with open('templates/workspace.html', 'r') as f:
    content = f.read()

old_kc = """                        <div id="attack-icons-section">
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

new_kc = """                        <div id="attack-icons-section">
                            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.25rem 0;">
                            <h4 style="font-family: var(--font-title); margin: 0; font-size: 0.9rem; color: var(--text-primary);">Techniques</h4>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem;">
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_goal')" title="Assessment Goal" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🚩</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_vuln')" title="Vulnerability Scan" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🔍</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_phish')" title="Phishing" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🎣</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_driveby')" title="Drive-by Compromise" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🖥️</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_wmi')" title="WMI / Scripting" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🛠️</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_inject')" title="Process Injection" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>💉</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_evade')" title="Defense Evasion" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🛡️</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_cred')" title="Credential Access" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>🔑</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_c2')" title="Command & Control" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px;">
                                    <span>📡</span>
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="addStudioElement('tech_generic')" title="Custom Technique" style="justify-content: center; padding: 0.5rem; font-size: 1.25rem; border-radius: 6px; grid-column: span 3;">
                                    <span>📝 Custom Technique</span>
                                </button>
                            </div>
                        </div>"""

if old_kc in content:
    content = content.replace(old_kc, new_kc)
    with open('templates/workspace.html', 'w') as f:
        f.write(content)
    print("workspace.html patched!")
else:
    print("Could not find the exact old block.")

