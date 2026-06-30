import re

with open('templates/index.html', 'r') as f:
    content = f.read()

select_html = """
                <div class="form-group" style="grid-column: span 2;">
                    <label>Load Report Template (Optional)</label>
                    <select id="project-template-select" class="form-control">
                        <option value="">-- No Template --</option>
                    </select>
                    <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">Selecting a template will populate the Project Workspace with predefined chapters and structures.</p>
                </div>
                """

if 'id="project-template-select"' not in content:
    content = content.replace('<div class="form-group">\n                    <label for="project-out-of-scope">Out of Scope</label>', select_html.strip() + '\n                <div class="form-group">\n                    <label for="project-out-of-scope">Out of Scope</label>')

with open('templates/index.html', 'w') as f:
    f.write(content)
