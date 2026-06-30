import re

with open('app.py', 'r') as f:
    content = f.read()

# 1. Add ReportTemplate model after Project model
if 'class ReportTemplate(db.Model):' not in content:
    model_code = """
class ReportTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    template_type = db.Column(db.String(100), default='Vulnerability Assessment')
    classification = db.Column(db.String(100), default='Confidential')
    footer_text = db.Column(db.String(255))
    structure = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'template_type': self.template_type,
            'classification': self.classification,
            'footer_text': self.footer_text,
            'structure': self.structure,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):"""
    content = content.replace("class Project(db.Model):", model_code.strip() + "\n\nclass Project(db.Model):")

# 2. Add API routes for Report Templates
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

# =========================================="""
    
    # Insert before the catch-all route at the bottom
    content = content.replace("@app.route('/', defaults={'path': ''})", api_code.strip() + "\n\n@app.route('/', defaults={'path': ''})")

# 3. Add report_template_id to Project model if missing
if 'report_template_id = db.Column(db.Integer' not in content:
    content = content.replace("location_type = db.Column(db.String(50))", "location_type = db.Column(db.String(50))\n    report_template_id = db.Column(db.Integer, db.ForeignKey('report_template.id'), nullable=True)")
    
if "'report_template_id': self.report_template_id" not in content:
    content = content.replace("'location_type': self.location_type,", "'location_type': self.location_type,\n            'report_template_id': self.report_template_id,")

if "project.report_template_id = data.get('report_template_id')" not in content:
    content = content.replace("project.location_type = data.get('location_type', project.location_type)", "project.location_type = data.get('location_type', project.location_type)\n        project.report_template_id = data.get('report_template_id', project.report_template_id)")

if "report_template_id=data.get('report_template_id')" not in content:
    content = content.replace("location_type=data.get('location_type', 'Remote'),", "location_type=data.get('location_type', 'Remote'),\n        report_template_id=data.get('report_template_id'),")

with open('app.py', 'w') as f:
    f.write(content)
