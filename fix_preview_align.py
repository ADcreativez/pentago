with open("static/js/preview_builder.js", "r") as f:
    content = f.read()

css_rules = """
/* Quill Text Align Classes */
.ql-align-center { text-align: center !important; }
.ql-align-right { text-align: right !important; }
.ql-align-justify { text-align: justify !important; }
.ql-align-left { text-align: left !important; }
"""

if ".ql-align-center" not in content:
    content = content.replace("1524-p { text-align: justify; line-height: 1.5; margin-bottom: 0.8rem; }", "p { text-align: justify; line-height: 1.5; margin-bottom: 0.8rem; }" + css_rules)
    # The grep output showed line numbers, I shouldn't replace the line number text literally
    content = content.replace("p { text-align: justify; line-height: 1.5; margin-bottom: 0.8rem; }", "p { text-align: justify; line-height: 1.5; margin-bottom: 0.8rem; }\n" + css_rules)
    
    with open("static/js/preview_builder.js", "w") as f:
        f.write(content)
    print("Added ql-align CSS rules.")
else:
    print("Rules already present.")
