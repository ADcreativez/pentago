import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Replace switchTab for consultants and config to redirect to /admin
def repl_switchTab(match):
    tab = match.group(1)
    if tab in ['consultants', 'config']:
        return f"window.location.href = '/admin#{tab}-view';"
    return match.group(0)

# But wait, inside switchTab() we have:
# function switchTab(tabId) {
# We should modify switchTab to do the redirect if it's an admin tab and we are NOT on /admin.

content = content.replace("function switchTab(tabId) {", """function switchTab(tabId) {
    if (['consultants', 'config'].includes(tabId)) {
        if (window.location.pathname !== '/admin') {
            window.location.href = '/admin?tab=' + tabId;
            return;
        }
    }
""")

# Also in admin.html we need a script to read ?tab= and call switchTab() on load!
with open('static/js/app.js', 'w') as f:
    f.write(content)

with open('templates/admin.html', 'a') as f:
    f.write('''
<script>
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        setTimeout(() => switchTab(tab), 100);
    } else {
        setTimeout(() => switchTab('config'), 100); // Default for admin
    }
});
</script>
''')
print("Admin navigation updated!")
