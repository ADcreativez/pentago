with open("static/js/preview_builder.js", "r") as f:
    content = f.read()

patch_code = """
        if (lang === 'en' && typeof tr === 'function') {
            t = tr(t);
        }
        
        // Convert Quill alignment classes to inline styles so DOMPurify doesn't strip them
        t = t.replace(/class=["']?ql-align-center["']?/g, 'style="text-align: center;"');
        t = t.replace(/class=["']?ql-align-right["']?/g, 'style="text-align: right;"');
        t = t.replace(/class=["']?ql-align-justify["']?/g, 'style="text-align: justify;"');
        t = t.replace(/class=["']?ql-align-left["']?/g, 'style="text-align: left;"');
"""

content = content.replace("        if (lang === 'en' && typeof tr === 'function') {\n            t = tr(t);\n        }", patch_code)

with open("static/js/preview_builder.js", "w") as f:
    f.write(content)
