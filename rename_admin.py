import os
import glob

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = content.replace(old_str, new_str)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Update app.py
replace_in_file('app.py', "@app.route('/admin')", "@app.route('/settings')")
replace_in_file('app.py', "@app.route('/api/admin/", "@app.route('/api/settings/")

# Update app.js
replace_in_file('static/js/app.js', "'/admin'", "'/settings'")
replace_in_file('static/js/app.js', "'/admin?tab=", "'/settings?tab=")
replace_in_file('static/js/app.js', "\"/admin?tab=", "\"/settings?tab=")
replace_in_file('static/js/app.js', "'/api/admin/", "'/api/settings/")
replace_in_file('static/js/app.js', "`/api/admin/", "`/api/settings/")

# Update HTML templates
for html_file in glob.glob('templates/*.html'):
    replace_in_file(html_file, 'href="/admin"', 'href="/settings"')
    replace_in_file(html_file, "href='/admin'", "href='/settings'")
    replace_in_file(html_file, 'href="/admin?', 'href="/settings?')
    replace_in_file(html_file, "window.location.href = '/admin'", "window.location.href = '/settings'")

print("Done renaming /admin to /settings")
