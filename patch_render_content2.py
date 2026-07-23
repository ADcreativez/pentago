with open("static/js/preview_builder.js", "r") as f:
    content = f.read()

import re

# Find the block we inserted previously
old_block = """        // Convert Quill alignment classes to inline styles so DOMPurify doesn't strip them
        t = t.replace(/class=["']?ql-align-center["']?/g, 'style="text-align: center;"');
        t = t.replace(/class=["']?ql-align-right["']?/g, 'style="text-align: right;"');
        t = t.replace(/class=["']?ql-align-justify["']?/g, 'style="text-align: justify;"');
        t = t.replace(/class=["']?ql-align-left["']?/g, 'style="text-align: left;"');"""

new_block = """        // Convert Quill alignment classes to inline styles so DOMPurify doesn't strip them
        t = t.replace(/class=["']([^"']*)ql-align-center([^"']*)["']/g, 'class="$1 $2" style="text-align: center;"');
        t = t.replace(/class=["']([^"']*)ql-align-right([^"']*)["']/g, 'class="$1 $2" style="text-align: right;"');
        t = t.replace(/class=["']([^"']*)ql-align-justify([^"']*)["']/g, 'class="$1 $2" style="text-align: justify;"');
        t = t.replace(/class=["']([^"']*)ql-align-left([^"']*)["']/g, 'class="$1 $2" style="text-align: left;"');
        // Also just in case they are exactly matched
        t = t.replace(/class=["']ql-align-center["']/g, 'style="text-align: center;"');
        t = t.replace(/class=["']ql-align-right["']/g, 'style="text-align: right;"');
        t = t.replace(/class=["']ql-align-justify["']/g, 'style="text-align: justify;"');
        t = t.replace(/class=["']ql-align-left["']/g, 'style="text-align: left;"');"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("static/js/preview_builder.js", "w") as f:
        f.write(content)
    print("Patched preview_builder.js")
else:
    print("Old block not found!")
