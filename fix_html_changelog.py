import re

with open('templates/index.html', 'r') as f:
    content = f.read()

# Change title and inputs
content = content.replace("App Source Code Versions", "System Changelog (App Update History)")

# Change warning to info
content = content.replace("Peringatan (Warning):</strong> Melakukan Restore ke versi lama akan mengembalikan source code aplikasi ke keadaan tersebut. Pastikan Anda telah menyimpan (Commit) status saat ini sebelum melakukan restore jika Anda tidak ingin kehilangan perubahan baru!", 
                          "Informasi:</strong> Catatan ini hanya sebagai log/history pembaruan fitur aplikasi. Tidak ada aksi sistematis (seperti restore) yang terjadi saat Anda menyimpan log di sini.")

# Change input fields
new_inputs = """
                            <input type="text" id="changelog-version-input" placeholder="e.g. 1.0.1" style="width: 100px; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-sans); font-size: 0.9rem;">
                            <input type="text" id="changelog-desc-input" placeholder="Update description..." style="width: 350px; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-sans); font-size: 0.9rem;">
                            <button class="btn btn-primary" onclick="saveChangelog()" style="font-size: 0.85rem; padding: 0.5rem 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; border-radius: 6px; height: 38px; cursor: pointer;">
                                Add Log Record
                            </button>
"""
# Replace the previous commit message input
content = re.sub(r'<input type="text" id="commit-message-input".*?</button>', new_inputs, content, flags=re.DOTALL)

# Change table headers
new_thead = """
                                <tr>
                                    <th style="width: 100px;">Version</th>
                                    <th style="width: 150px;">Date</th>
                                    <th>Feature Updates / Description</th>
                                    <th style="width: 80px;">Action</th>
                                </tr>
"""
content = re.sub(r'<tr>\s*<th>Hash</th>.*?</tr>', new_thead, content, flags=re.DOTALL)

with open('templates/index.html', 'w') as f:
    f.write(content)
