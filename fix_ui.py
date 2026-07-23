import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_btn = """<button class="btn btn-danger" onclick="deleteKCIconRow(${index})">Delete</button>"""
new_btn = """<button type="button" onclick="deleteKCIconRow(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'" title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>"""

if old_btn in appjs:
    appjs = appjs.replace(old_btn, new_btn)
    
old_actions_td = """<td><button class="btn btn-danger" onclick="deleteKCIconRow(${index})">Delete</button></td>"""
new_actions_td = f"""<td style="text-align:center; vertical-align:middle;">{new_btn}</td>"""
# if the previous replace already happened, the td might just have the new btn.
# Let's just run a safer replace for the whole row or the button part.

old_row = """                <td><input type="text" class="kc-label-input" value="${icon.label}" onchange="killChainIconsConfig[${index}].label = this.value" style="width:100%; padding:0.4rem; border:1px solid #ccc; border-radius:4px;"></td>
                <td><button type="button" onclick="deleteKCIconRow(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'" title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button></td>"""
new_row = """                <td style="vertical-align:middle;"><input type="text" class="kc-label-input" value="${icon.label}" onchange="killChainIconsConfig[${index}].label = this.value" style="width:100%; padding:0.6rem; border:1px solid #ccc; border-radius:4px; font-size:0.9rem;"></td>
                <td style="vertical-align:middle; text-align:center;">
                    <button type="button" onclick="deleteKCIconRow(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s; display:inline-flex; align-items:center; justify-content:center;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'" title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>"""
if old_row in appjs:
    appjs = appjs.replace(old_row, new_row)
else:
    # Just replace the td
    old_td1 = """<td><input type="text" class="kc-label-input" value="${icon.label}" onchange="killChainIconsConfig[${index}].label = this.value" style="width:100%; padding:0.4rem; border:1px solid #ccc; border-radius:4px;"></td>"""
    new_td1 = """<td style="vertical-align:middle;"><input type="text" class="kc-label-input" value="${icon.label}" onchange="killChainIconsConfig[${index}].label = this.value" style="width:100%; padding:0.6rem; border:1px solid #ccc; border-radius:4px; font-size:0.9rem;"></td>"""
    appjs = appjs.replace(old_td1, new_td1)
    
    old_td2 = """<td><button class="btn btn-danger" onclick="deleteKCIconRow(${index})">Delete</button></td>"""
    new_td2 = """<td style="vertical-align:middle; text-align:center;">
                    <button type="button" onclick="deleteKCIconRow(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s; display:inline-flex; align-items:center; justify-content:center;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'" title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>"""
    appjs = appjs.replace(old_td2, new_td2)
    

old_col1 = """                <td style="text-align:center;">
                    <div style="margin-bottom:0.5rem; min-height:36px; display:flex; align-items:center; justify-content:center;">"""
new_col1 = """                <td style="text-align:center; vertical-align:middle; padding: 0.75rem;">
                    <div style="margin-bottom:0.75rem; min-height:40px; display:flex; align-items:center; justify-content:center;">"""
appjs = appjs.replace(old_col1, new_col1)

old_input1 = """<input type="text" class="kc-emoji-input" placeholder="Emoji or URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="flex:1; text-align:center; padding:0.4rem; font-size:0.85rem; border:1px solid #ccc; border-radius:4px;">"""
new_input1 = """<input type="text" class="kc-emoji-input" placeholder="Emoji or URL..." value="${icon.emoji.includes('Downloading') ? '' : icon.emoji}" onblur="handleIconInputBlur(this, ${index})" style="flex:1; text-align:center; padding:0.5rem; font-size:0.9rem; border:1px solid #ccc; border-radius:4px;">"""
appjs = appjs.replace(old_input1, new_input1)

old_input2 = """<label class="btn btn-secondary" style="margin:0; padding:0.4rem; cursor:pointer; border-radius:4px;" title="Upload File Lokal">"""
new_input2 = """<label class="btn btn-secondary" style="margin:0; padding:0.5rem 0.6rem; cursor:pointer; border-radius:4px; display:inline-flex; align-items:center;" title="Upload File Lokal">"""
appjs = appjs.replace(old_input2, new_input2)


with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("app.js updated")
