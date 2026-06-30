with open('app.py', 'r') as f:
    content = f.read()

if "report_template_id = db.Column(" not in content:
    content = content.replace("location_type = db.Column(db.String(50), default='Remote')", "location_type = db.Column(db.String(50), default='Remote')\n    report_template_id = db.Column(db.Integer, db.ForeignKey('report_template.id'))")

with open('app.py', 'w') as f:
    f.write(content)
