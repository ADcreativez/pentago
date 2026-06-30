import re

with open('static/js/app.js', 'r') as f:
    content = f.read()

# Replace the redefined renderMd
bad_code = """    const renderMd = (txt) => {
        if (!txt) return '<p style="color: var(--text-secondary); font-style: italic;">Belum ada konten (klik Edit untuk mengisi).</p>';
        return renderMarkdownToHtml(txt, { val: 0 });
    };"""

good_code = """    const renderChapterMd = (txt) => {
        if (!txt) return '<p style="color: var(--text-secondary); font-style: italic;">Belum ada konten (klik Edit untuk mengisi).</p>';
        return renderMarkdownToHtml(txt, { val: 0 });
    };"""

content = content.replace(bad_code, good_code)

# Update the calls to use renderChapterMd
content = content.replace("${renderMd(p.exec_summary)}", "${renderChapterMd(p.exec_summary)}")
content = content.replace("${renderMd(p.methodology_text)}", "${renderChapterMd(p.methodology_text)}")

with open('static/js/app.js', 'w') as f:
    f.write(content)

