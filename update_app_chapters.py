import re

with open('app.py', 'r') as f:
    content = f.read()

# 1. Add columns to Project model
if 'exec_summary = db.Column(EncryptedText)' not in content:
    content = content.replace("appendix = db.Column(EncryptedText)", "appendix = db.Column(EncryptedText)\n    exec_summary = db.Column(EncryptedText)\n    methodology_text = db.Column(EncryptedText)")

# 2. Update to_dict() in Project
if "'exec_summary': self.exec_summary," not in content:
    content = content.replace("'appendix': self.appendix,", "'appendix': self.appendix,\n            'exec_summary': self.exec_summary,\n            'methodology_text': self.methodology_text,")

# 3. Update /api/projects route POST/PUT logic
if "exec_summary = data.get('exec_summary')" not in content:
    put_logic_replacement = """
        if 'summary' in data:
            project.summary = data.get('summary')
        if 'appendix' in data:
            project.appendix = data.get('appendix')
        if 'exec_summary' in data:
            project.exec_summary = data.get('exec_summary')
        if 'methodology_text' in data:
            project.methodology_text = data.get('methodology_text')
"""
    content = re.sub(r"if 'summary' in data:.*?project\.appendix = data\.get\('appendix'\)", put_logic_replacement.strip(), content, flags=re.DOTALL)

with open('app.py', 'w') as f:
    f.write(content)
