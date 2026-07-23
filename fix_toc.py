import re
import glob

files = [
    '/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js',
    '/Users/macbookpro/ErwanzCode/Pentago/static/js/preview_builder.js'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix DAFTAR ISI ignoring logic
    new_content = content.replace(
        "if (titleText.toLowerCase() === 'daftar isi' || titleText.toLowerCase() === 'pratinjau') continue;",
        "if (titleText.toLowerCase() === 'daftar isi' || titleText.toLowerCase() === 'pratinjau' || titleText.toLowerCase() === 'table of contents' || titleText.toLowerCase() === 'preview') continue;"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Done patching.")
