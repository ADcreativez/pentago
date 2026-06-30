import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Fix hide logic
content = content.replace("document.getElementById('config-blocklist-section').style.display = 'none';",
                          "document.getElementById('config-blocklist-section').style.display = 'none';\n    const verSec = document.getElementById('config-versions-section'); if(verSec) verSec.style.display = 'none';")

# Fix show logic
show_logic = """    } else if (subtab === 'versions') {
        const btn = document.getElementById('tab-versions-btn');
        if (btn) btn.classList.add('active');
        const sec = document.getElementById('config-versions-section');
        if (sec) sec.style.display = 'block';
        if (typeof loadGitLogs === 'function') loadGitLogs();
"""
content = content.replace("    } else if (subtab === 'blocklist') {", show_logic + "    } else if (subtab === 'blocklist') {")

with open('static/js/app.js', 'w') as f:
    f.write(content)
