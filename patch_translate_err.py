with open('static/js/app.js', 'r') as f:
    content = f.read()

target = """if (resData.translated) {
                        previewHtml = resData.translated;
                    }"""

replacement = """if (resData.translated) {
                        previewHtml = resData.translated;
                    } else if (resData.error) {
                        alert("AI Translation Error: " + resData.error);
                    }"""

if target in content and "else if (resData.error)" not in content:
    content = content.replace(target, replacement)
    with open('static/js/app.js', 'w') as f:
        f.write(content)
    print("Patched app.js translation error handling")
else:
    print("Already patched or target not found")
