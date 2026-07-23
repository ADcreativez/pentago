import sys

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

old_switch = """    if (subtab === 'users') {"""
new_switch = """    const kSec = document.getElementById('config-kcicons-section'); if(kSec) kSec.style.display = 'none';

    if (subtab === 'users') {"""

appjs = appjs.replace(old_switch, new_switch, 1)

old_switch2 = """    } else if (subtab === 'blocklist') {
        document.getElementById('tab-blocklist-btn').classList.add('active');
        document.getElementById('config-blocklist-section').style.display = 'block';
        loadBlocklist();
    }
}"""
new_switch2 = """    } else if (subtab === 'blocklist') {
        document.getElementById('tab-blocklist-btn').classList.add('active');
        document.getElementById('config-blocklist-section').style.display = 'block';
        loadBlocklist();
    } else if (subtab === 'kcicons') {
        const btn = document.getElementById('tab-kcicons-btn');
        if (btn) btn.classList.add('active');
        const sec = document.getElementById('config-kcicons-section');
        if (sec) sec.style.display = 'block';
        loadKCIconsConfig();
    }
}"""
appjs = appjs.replace(old_switch2, new_switch2, 1)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
print("switch patched")
