from app import app, db
import sqlite3

try:
    with sqlite3.connect('pentago.db') as conn:
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE project ADD COLUMN technical_report TEXT")
        print("Column technical_report added successfully!")
except Exception as e:
    print("Error:", e)

with open('app.py', 'r') as f:
    content = f.read()

if 'technical_report = db.Column(EncryptedText)' not in content:
    content = content.replace("exec_summary = db.Column(EncryptedText)", "exec_summary = db.Column(EncryptedText)\n    technical_report = db.Column(EncryptedText)")

if "'technical_report': self.technical_report" not in content:
    content = content.replace("'exec_summary': self.exec_summary,", "'exec_summary': self.exec_summary,\n            'technical_report': self.technical_report,")

if "project.technical_report = data.get('technical_report')" not in content:
    put_logic_replacement = """        if 'methodology_text' in data:
            project.methodology_text = data.get('methodology_text')
        if 'technical_report' in data:
            project.technical_report = data.get('technical_report')"""
    content = content.replace("        if 'methodology_text' in data:\n            project.methodology_text = data.get('methodology_text')", put_logic_replacement)

with open('app.py', 'w') as f:
    f.write(content)
