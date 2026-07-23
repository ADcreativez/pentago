import re
import glob

files = [
    '/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js',
    '/Users/macbookpro/ErwanzCode/Pentago/static/js/preview_builder.js'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace(
        "if (typeof window.translateText === 'function') {\n            return window.translateText(text, lang);\n        }",
        "if (typeof translateText === 'function') {\n            return translateText(text, lang);\n        }"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Done patching.")
