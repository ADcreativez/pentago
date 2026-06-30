import re

with open('app.py', 'r') as f:
    content = f.read()

# Add ReportTemplate model
model_code = """
class ReportTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    template_type = db.Column(db.String(50))
    default_title = db.Column(db.String(250))
    classification = db.Column(db.String(50))
    background_text = db.Column(db.Text)
    methodology_text = db.Column(db.Text)
    footer_text = db.Column(db.String(250))
    structure = db.Column(db.Text)
    client_logo = db.Column(db.Text)
    auditor_logo = db.Column(db.Text)
    header_alignment = db.Column(db.String(50), default='center')
    show_client_logo = db.Column(db.Integer, default=1)
    show_auditor_logo = db.Column(db.Integer, default=1)
    start_page_num = db.Column(db.Integer, default=2)
    created_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'template_type': self.template_type,
            'default_title': self.default_title,
            'classification': self.classification,
            'background_text': self.background_text,
            'methodology_text': self.methodology_text,
            'footer_text': self.footer_text,
            'structure': self.structure,
            'client_logo': self.client_logo,
            'auditor_logo': self.auditor_logo,
            'header_alignment': self.header_alignment,
            'show_client_logo': self.show_client_logo,
            'show_auditor_logo': self.show_auditor_logo,
            'start_page_num': self.start_page_num
        }
"""

# Insert model after class Project
content = content.replace("class Finding(db.Model):", model_code + "\nclass Finding(db.Model):")

# Add API Route
api_code = """
@app.route('/api/report_templates/<int:template_id>', methods=['GET'])
@login_required
def api_get_report_template(template_id):
    tpl = ReportTemplate.query.get_or_404(template_id)
    return jsonify(tpl.to_dict())

@app.route('/api/report_templates/<int:template_id>', methods=['PUT'])
@login_required
def api_update_report_template(template_id):
    if session.get('role') != 'Admin':
        return jsonify({'error': 'Unauthorized'}), 403
    tpl = ReportTemplate.query.get_or_404(template_id)
    data = request.json
    if 'structure' in data:
        tpl.structure = data['structure']
    db.session.commit()
    return jsonify(tpl.to_dict())
"""

# Insert API before testing guides
content = content.replace("# Testing Guides CRUD API", api_code + "\n# Testing Guides CRUD API")

with open('app.py', 'w') as f:
    f.write(content)
