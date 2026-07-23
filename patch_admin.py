import sys

# 1. Patch admin.html
with open('templates/admin.html', 'r') as f:
    content = f.read()

old_tabs = """<button class="config-tab-btn" id="tab-versions-btn" onclick="switchConfigSubTab('versions')" style="background: none; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">Change Log</button>
                </div>"""
new_tabs = """<button class="config-tab-btn" id="tab-versions-btn" onclick="switchConfigSubTab('versions')" style="background: none; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">Change Log</button>
                    <button class="config-tab-btn" id="tab-kcicons-btn" onclick="switchConfigSubTab('kcicons')" style="background: none; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">Kill Chain Icons</button>
                </div>"""
content = content.replace(old_tabs, new_tabs)

new_section = """
                <!-- Config Kill Chain Icons Sub-section -->
                <div id="config-kcicons-section" class="config-sub-section" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-family: var(--font-title); font-size: 1.3rem;">Cyber Kill Chain Dynamic Icons</h3>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary" onclick="addKCIconRow()">+ Add Icon</button>
                            <button class="btn btn-secondary" onclick="saveKCIcons()" style="background: #10b981; border-color: #10b981; color: white;">💾 Save Configuration</button>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Configure the specific attack techniques (emoji and name) available in the Cyber Kill Chain studio toolbox.</p>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 80px;">Icon (Emoji)</th>
                                    <th>Technique Name</th>
                                    <th style="width: 100px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="kcicons-table-body">
                                <!-- Dynamically populated via JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
"""
# Insert right before App Versions / System Changelog Sub-section
content = content.replace("<!-- App Versions / System Changelog Sub-section -->", new_section + "\n                <!-- App Versions / System Changelog Sub-section -->")

with open('templates/admin.html', 'w') as f:
    f.write(content)
print("admin.html patched")
