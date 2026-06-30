with open('static/js/app.js', 'r') as f:
    content = f.read()

old_str = """    if (window.renderWorkspaceChapters) {
        window.renderWorkspaceChapters();
    }"""

new_str = """    try {
        if (window.renderWorkspaceChapters) {
            window.renderWorkspaceChapters();
        }
    } catch (err_render) {
        console.error("Error in renderWorkspaceChapters:", err_render);
        alert("Error loading chapters: " + err_render.message);
    }"""

if old_str in content:
    content = content.replace(old_str, new_str)
    with open('static/js/app.js', 'w') as f:
        f.write(content)
    print("Patched!")
else:
    print("String not found!")
