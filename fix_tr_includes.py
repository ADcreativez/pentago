import re
import glob

files = [
    '/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js',
    '/Users/macbookpro/ErwanzCode/Pentago/static/js/preview_builder.js'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(
        r"html\.includes\('<h2 class=\"sh-blue\">' \+ \(workspaceDocs\['([^']+)'\] \|\| tr\('([^']+)'\)\) \+ '</h2>'\)",
        r"html.includes('<h2 class=\"sh-blue\">' + tr(workspaceDocs['\1'] || '\2') + '</h2>')",
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Done patching.")
