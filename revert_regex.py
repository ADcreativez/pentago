with open("static/js/preview_builder.js", "r") as f:
    content = f.read()

import re

# We want to remove these lines:
lines_to_remove = [
    "// Convert Quill alignment classes to inline styles so DOMPurify doesn't strip them",
    "t = t.replace(/class=[\"']([^\"']*)ql-align-center([^\"']*)[\"']/g, 'class=\"$1 $2\" style=\"text-align: center;\"');",
    "t = t.replace(/class=[\"']([^\"']*)ql-align-right([^\"']*)[\"']/g, 'class=\"$1 $2\" style=\"text-align: right;\"');",
    "t = t.replace(/class=[\"']([^\"']*)ql-align-justify([^\"']*)[\"']/g, 'class=\"$1 $2\" style=\"text-align: justify;\"');",
    "t = t.replace(/class=[\"']([^\"']*)ql-align-left([^\"']*)[\"']/g, 'class=\"$1 $2\" style=\"text-align: left;\"');",
    "// Also just in case they are exactly matched",
    "t = t.replace(/class=[\"']ql-align-center[\"']/g, 'style=\"text-align: center;\"');",
    "t = t.replace(/class=[\"']ql-align-right[\"']/g, 'style=\"text-align: right;\"');",
    "t = t.replace(/class=[\"']ql-align-justify[\"']/g, 'style=\"text-align: justify;\"');",
    "t = t.replace(/class=[\"']ql-align-left[\"']/g, 'style=\"text-align: left;\"');"
]

for line in lines_to_remove:
    content = content.replace(line, "")

with open("static/js/preview_builder.js", "w") as f:
    f.write(content)
