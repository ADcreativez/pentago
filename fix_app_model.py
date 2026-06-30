with open('app.py', 'r') as f:
    content = f.read()

# Add columns
cols_to_add = """
    report_version = db.Column(db.String(50))
    report_date = db.Column(db.String(50))
    report_author = db.Column(db.String(150))
    change_reference = db.Column(EncryptedText)
    client_approver_name = db.Column(EncryptedText)
"""

content = content.replace("    findings = db.relationship('Finding', backref='project', lazy=True, cascade=\"all, delete-orphan\")", 
                          cols_to_add + "    findings = db.relationship('Finding', backref='project', lazy=True, cascade=\"all, delete-orphan\")")

# Add to to_dict
dict_to_add = """
            'report_version': self.report_version,
            'report_date': self.report_date,
            'report_author': self.report_author,
            'change_reference': self.change_reference,
            'client_approver_name': self.client_approver_name,
"""
content = content.replace("            'retest_activity': self.retest_activity,", 
                          "            'retest_activity': self.retest_activity," + dict_to_add)

# Add to POST
post_to_add = """
            report_version=data.get('report_version', ''),
            report_date=data.get('report_date', ''),
            report_author=data.get('report_author', ''),
            change_reference=data.get('change_reference', ''),
            client_approver_name=data.get('client_approver_name', ''),
"""
content = content.replace("            threat_model=data.get('threat_model', '')\n        )", 
                          "            threat_model=data.get('threat_model', '')," + post_to_add + "        )")

# Add to PUT
put_fields = ['report_version', 'report_date', 'report_author', 'change_reference', 'client_approver_name']
put_to_add = ""
for f in put_fields:
    put_to_add += f"        if '{f}' in data: project.{f} = data['{f}']\n"

content = content.replace("        if 'retest_activity' in data: project.retest_activity = data['retest_activity']", 
                          "        if 'retest_activity' in data: project.retest_activity = data['retest_activity']\n" + put_to_add)

with open('app.py', 'w') as f:
    f.write(content)
