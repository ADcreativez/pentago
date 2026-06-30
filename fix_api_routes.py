import re

with open('app.py', 'r') as f:
    content = f.read()

if '@app.route(\'/api/report_templates' not in content:
    api_code = """
# ==========================================
# Report Template APIs
# ==========================================

@app.route('/api/report_templates', methods=['GET'])
@login_required
def get_report_templates():
    templates = ReportTemplate.query.order_by(ReportTemplate.created_at.desc()).all()
    return jsonify([t.to_dict() for t in templates])

@app.route('/api/report_templates/<int:id>', methods=['GET'])
@login_required
def get_report_template(id):
    t = ReportTemplate.query.get_or_404(id)
    return jsonify(t.to_dict())

@app.route('/api/report_templates', methods=['POST'])
@login_required
def create_report_template():
    data = request.json
    t = ReportTemplate(
        name=data.get('name', 'Untitled Template'),
        template_type=data.get('template_type', 'Vulnerability Assessment'),
        classification=data.get('classification', 'Confidential'),
        footer_text=data.get('footer_text', ''),
        structure=data.get('structure', '[]')
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201

@app.route('/api/report_templates/<int:id>', methods=['PUT'])
@login_required
def update_report_template(id):
    t = ReportTemplate.query.get_or_404(id)
    data = request.json
    t.name = data.get('name', t.name)
    t.template_type = data.get('template_type', t.template_type)
    t.classification = data.get('classification', t.classification)
    t.footer_text = data.get('footer_text', t.footer_text)
    if 'structure' in data:
        t.structure = data.get('structure')
    db.session.commit()
    return jsonify(t.to_dict())

@app.route('/api/report_templates/<int:id>', methods=['DELETE'])
@login_required
def delete_report_template(id):
    t = ReportTemplate.query.get_or_404(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

# ==========================================
"""
    content = content.replace("if __name__ == '__main__':", api_code + "if __name__ == '__main__':")

with open('app.py', 'w') as f:
    f.write(content)
