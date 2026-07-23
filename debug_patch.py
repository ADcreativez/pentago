with open("static/js/preview_builder.js", "r") as f:
    content = f.read()

# Replace the DOMPurify line to include a console.log
old_line = "try { return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(t, { ADD_ATTR: ['class', 'style'] }) : t; } catch(e) { return t; }"
new_line = "try { let res = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(t, { ADD_ATTR: ['class', 'style'] }) : t; console.log('AFTER PURIFY:', res); return res; } catch(e) { return t; }"

if old_line in content:
    content = content.replace(old_line, new_line)
    with open("static/js/preview_builder.js", "w") as f:
        f.write(content)
    print("Patched preview_builder.js with console.log")
else:
    print("Could not find the line to patch.")
