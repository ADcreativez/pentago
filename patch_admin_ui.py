with open('static/js/app.js', 'r') as f:
    content = f.read()

patch_code = """
    // Show System Config only for Admin
    const navSysConfig = document.getElementById('nav-system-config');
    if (navSysConfig) {
        navSysConfig.style.display = (currentUser && currentUser.role === 'Admin') ? 'flex' : 'none';
    }
"""

if 'navSysConfig.style.display' not in content:
    content = content.replace("function checkAdminUI() {", "function checkAdminUI() {" + patch_code)
    with open('static/js/app.js', 'w') as f:
        f.write(content)
    print("Patched admin ui")
else:
    print("Already patched admin ui")
