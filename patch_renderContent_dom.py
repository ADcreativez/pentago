with open("static/js/preview_builder.js", "r") as f:
    content = f.read()

import re

# Find the renderContent function
# We want to insert our DOMParser logic right at the beginning of renderContent
old_start = """    window.renderContent = function(text, lang = 'id') {
        if (!text) return '';
        let t = text;"""

new_start = """    window.renderContent = function(text, lang = 'id') {
        if (!text) return '';
        let t = text;
        
        if (typeof DOMParser !== 'undefined') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(t, 'text/html');
                
                doc.querySelectorAll('.ql-align-center').forEach(el => { el.style.textAlign = 'center'; el.classList.remove('ql-align-center'); });
                doc.querySelectorAll('.ql-align-right').forEach(el => { el.style.textAlign = 'right'; el.classList.remove('ql-align-right'); });
                doc.querySelectorAll('.ql-align-justify').forEach(el => { el.style.textAlign = 'justify'; el.classList.remove('ql-align-justify'); });
                doc.querySelectorAll('.ql-align-left').forEach(el => { el.style.textAlign = 'left'; el.classList.remove('ql-align-left'); });
                
                t = doc.body.innerHTML;
            } catch (e) {}
        }
"""

content = content.replace(old_start, new_start)

with open("static/js/preview_builder.js", "w") as f:
    f.write(content)
