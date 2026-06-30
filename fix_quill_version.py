import re

with open('templates/index.html', 'r') as f:
    html = f.read()

html = html.replace('<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">', '<link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet" />')
html = html.replace('<script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>', '<script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>')

with open('templates/index.html', 'w') as f:
    f.write(html)

with open('static/js/app.js', 'r') as f:
    appjs = f.read()

# Update initWorkspaceEditors toolbarOptions
old_toolbar = """    // WordPress-style full toolbar options
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        ['clean']                                         // remove formatting button
    ];"""

new_toolbar = """    // WordPress-style full toolbar options
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula', 'table'],
        ['clean']                                         // remove formatting button
    ];"""

appjs = appjs.replace(old_toolbar, new_toolbar)

old_init = """            window.chapterEditors[secEditorId] = new Quill('#' + secEditorId, {
                theme: 'snow',
                modules: {
                    toolbar: toolbarOptions
                }
            });"""

new_init = """            window.chapterEditors[secEditorId] = new Quill('#' + secEditorId, {
                theme: 'snow',
                modules: {
                    toolbar: toolbarOptions,
                    table: true
                }
            });"""

appjs = appjs.replace(old_init, new_init)

# Fix sub-chapters
old_sub_init = """                    window.chapterEditors[subEditorId] = new Quill('#' + subEditorId, {
                        theme: 'snow',
                        modules: {
                            toolbar: toolbarOptions
                        }
                    });"""

new_sub_init = """                    window.chapterEditors[subEditorId] = new Quill('#' + subEditorId, {
                        theme: 'snow',
                        modules: {
                            toolbar: toolbarOptions,
                            table: true
                        }
                    });"""

appjs = appjs.replace(old_sub_init, new_sub_init)

with open('static/js/app.js', 'w') as f:
    f.write(appjs)
