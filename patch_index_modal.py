with open('templates/index.html', 'r') as f:
    content = f.read()

modal_code = """
    <!-- System Config Modal -->
    <div id="system-config-modal" class="modal-overlay">
        <div class="modal">
            <div class="modal-header">
                <h3>System Configuration</h3>
                <span class="close-modal" onclick="closeSystemConfigModal()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="system-config-form" onsubmit="saveSystemConfig(event)">
                    <div style="margin-bottom: 1.25rem;">
                        <label for="config-gemini-key" style="display: block; font-weight: 600; font-size: 0.85rem; color: var(--accent-blue); margin-bottom: 0.5rem;">Google Gemini API Key</label>
                        <input type="password" id="config-gemini-key" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-sans); font-size: 0.95rem;" placeholder="Enter Gemini API Key (AI Translator)">
                        <small style="color: var(--text-secondary); display: block; margin-top: 0.25rem;">Used for the AI Translator feature. Kept encrypted.</small>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="closeSystemConfigModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-sysconfig">Save Configuration</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
"""

if 'id="system-config-modal"' not in content:
    content = content.replace('<!-- Report Template Modal -->', modal_code + '\n<!-- Report Template Modal -->')
    with open('templates/index.html', 'w') as f:
        f.write(content)
    print("Added modal")
else:
    print("Modal already exists")
