with open("static/js/preview_builder.js", "r") as f:
    code = f.read()

# I want to replace `\`` with ``` and `\${` with `${` inside the methodologyHtml1b section.
# Let's just find the exact block and fix it.
import re
new_code = code.replace("return \\`\n", "return `\n")
new_code = new_code.replace("\\${", "${")
new_code = new_code.replace("</tr>\n                \\`;", "</tr>\n                `;")

with open("static/js/preview_builder.js", "w") as f:
    f.write(new_code)
