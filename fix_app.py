import re

with open('app.py', 'r') as f:
    content = f.read()

# Add columns
cols = """    report_template_id = db.Column(db.Integer, db.ForeignKey('report_template.id'))
    spk_number = db.Column(db.String(100))
    report_version = db.Column(db.String(50))
    report_date = db.Column(db.String(50))
    report_author = db.Column(db.String(100))
    change_reference = db.Column(EncryptedText)
    client_approver_name = db.Column(EncryptedText)
    owasp_checklist = db.Column(EncryptedText)
    risk_assessment = db.Column(EncryptedText)
    methodology_flow = db.Column(EncryptedText)
    flow_description = db.Column(EncryptedText)
    technical_report = db.Column(EncryptedText)
    client_logo = db.Column(EncryptedText)
    auditor_logo = db.Column(EncryptedText)
    use_watermark = db.Column(db.Boolean, default=False)
"""

content = content.replace("    created_at = db.Column(db.DateTime, default=datetime.utcnow)", cols + "    created_at = db.Column(db.DateTime, default=datetime.utcnow)")

# Add to_dict keys
to_dict_add = """            'report_template_id': self.report_template_id,
            'spk_number': self.spk_number,
            'report_version': self.report_version,
            'report_date': self.report_date,
            'report_author': self.report_author,
            'change_reference': self.change_reference,
            'client_approver_name': self.client_approver_name,
            'owasp_checklist': self.owasp_checklist,
            'risk_assessment': self.risk_assessment,
            'methodology_flow': self.methodology_flow,
            'flow_description': self.flow_description,
            'technical_report': self.technical_report,
            'client_logo': self.client_logo,
            'auditor_logo': self.auditor_logo,
            'use_watermark': self.use_watermark,
"""

content = content.replace("            'created_at': self.created_at.strftime('%Y-%m-%d'),", to_dict_add + "            'created_at': self.created_at.strftime('%Y-%m-%d'),")

with open('app.py', 'w') as f:
    f.write(content)
