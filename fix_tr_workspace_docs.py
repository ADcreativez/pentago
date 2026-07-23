import re
import glob

files = [
    '/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js',
    '/Users/macbookpro/ErwanzCode/Pentago/static/js/preview_builder.js'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace pattern: ${workspaceDocs['title_X'] || tr("Y")}
    # with: ${tr(workspaceDocs['title_X'] || "Y")}
    
    # Pattern to match: \$\{workspaceDocs\[('[^']+')\] \|\| tr\((['"][^'"]+['"])\)\}
    # Replacement: ${tr(workspaceDocs[\1] || \2)}
    
    new_content = re.sub(
        r"\$\{workspaceDocs\[('[^']+')\] \|\| tr\((['\"][^'\"]+['\"])\)\}",
        r"${tr(workspaceDocs[\1] || \2)}",
        content
    )
    
    # Also handle cases with sub.title etc
    # ${workspaceDocs['title_' + sub.id] || sub.title || tr("4.1 Catatan Tambahan")}
    # -> ${tr(workspaceDocs['title_' + sub.id] || sub.title || "4.1 Catatan Tambahan")}
    new_content = re.sub(
        r"\$\{workspaceDocs\[('[^']+' \+ [^\]]+)\] \|\| ([^\|]+) \|\| tr\((['\"][^'\"]+['\"])\)\}",
        r"${tr(workspaceDocs[\1] || \2 || \3)}",
        new_content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Done patching.")
