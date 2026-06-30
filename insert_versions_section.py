import re

with open('templates/index.html', 'r') as f:
    content = f.read()

versions_section = """
                <!-- App Versions / System Changelog Sub-section -->
                <div id="config-versions-section" class="config-sub-section" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-family: var(--font-title); font-size: 1.3rem;">System Changelog (App Update History)</h3>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <input type="text" id="changelog-version-input" placeholder="e.g. 1.0.1" style="width: 100px; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-sans); font-size: 0.9rem;">
                            <input type="text" id="changelog-desc-input" placeholder="Update description..." style="width: 350px; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-sans); font-size: 0.9rem;">
                            <button class="btn btn-primary" onclick="saveChangelog()" style="font-size: 0.85rem; padding: 0.5rem 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; border-radius: 6px; height: 38px; cursor: pointer;">
                                Add Log Record
                            </button>
                        </div>
                    </div>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; color: #1e3a8a; font-size: 0.9rem; line-height: 1.5;">
                        <strong>Informasi:</strong> Catatan ini hanya sebagai log/history pembaruan fitur aplikasi. Tidak ada aksi sistematis (seperti restore) yang terjadi saat Anda menyimpan log di sini.
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 100px;">Version</th>
                                    <th style="width: 150px;">Date</th>
                                    <th>Feature Updates / Description</th>
                                    <th style="width: 80px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="git-log-tbody">
                                <!-- Dynamic rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
"""

content = content.replace("                            <tbody id=\"blocklist-table-body\">\n                                <!-- Dynamically populated -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>", 
                          "                            <tbody id=\"blocklist-table-body\">\n                                <!-- Dynamically populated -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n" + versions_section)

with open('templates/index.html', 'w') as f:
    f.write(content)
