import re

with open('templates/index.html', 'r') as f:
    content = f.read()

# Add button
btn_html = """<button class="config-tab-btn" id="tab-blocklist-btn" onclick="switchConfigSubTab('blocklist')" style="background: none; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">IP Blocklist</button>
                    <button class="config-tab-btn" id="tab-versions-btn" onclick="switchConfigSubTab('versions')" style="background: none; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">App Versions</button>"""
content = content.replace("<button class=\"config-tab-btn\" id=\"tab-blocklist-btn\" onclick=\"switchConfigSubTab('blocklist')\" style=\"background: none; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 600; font-size: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;\">IP Blocklist</button>", btn_html)


# Add sub-section at the end of config modal
versions_section = """
                <!-- App Versions Sub-section -->
                <div id="config-versions-section" class="config-sub-section" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-family: var(--font-title); font-size: 1.3rem;">App Source Code Versions</h3>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <input type="text" id="commit-message-input" placeholder="Update description..." style="width: 250px; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-sans); font-size: 0.9rem;">
                            <button class="btn btn-primary" onclick="commitCurrentVersion()" style="font-size: 0.85rem; padding: 0.5rem 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; border-radius: 6px; height: 38px; cursor: pointer;">
                                Save Current Version
                            </button>
                        </div>
                    </div>
                    <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; color: #92400e; font-size: 0.9rem; line-height: 1.5;">
                        <strong>Peringatan (Warning):</strong> Melakukan Restore ke versi lama akan mengembalikan source code aplikasi ke keadaan tersebut. Pastikan Anda telah menyimpan (Commit) status saat ini sebelum melakukan restore jika Anda tidak ingin kehilangan perubahan baru!
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Hash</th>
                                    <th>Date</th>
                                    <th>Author</th>
                                    <th>Message (Log Change)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="git-log-tbody">
                                <!-- Dynamic rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
"""

# Find where config-blocklist-section ends and insert this.
content = content.replace('                    <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">\n                        <button type="button" class="btn btn-secondary" onclick="closeConfigModal()">Tutup</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>',
                          '                    <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">\n                        <button type="button" class="btn btn-secondary" onclick="closeConfigModal()">Tutup</button>\n                    </div>\n                </div>\n' + versions_section + '\n            </div>\n        </div>\n    </div>')

with open('templates/index.html', 'w') as f:
    f.write(content)
