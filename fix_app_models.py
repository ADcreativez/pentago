import re

with open('app.py', 'r') as f:
    content = f.read()

models = """
class SystemChangelog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'date': self.date,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ReportTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    template_type = db.Column(db.String(50))
    default_title = db.Column(db.String(250))
    classification = db.Column(db.String(50))
    background_text = db.Column(db.Text)
    methodology_text = db.Column(db.Text)
    footer_text = db.Column(db.String(250))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    structure = db.Column(db.Text)
    client_logo = db.Column(db.Text)
    auditor_logo = db.Column(db.Text)
    header_alignment = db.Column(db.String(50), default='center')
    show_client_logo = db.Column(db.Integer, default=1)
    show_auditor_logo = db.Column(db.Integer, default=1)
    start_page_num = db.Column(db.Integer, default=2)

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
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'structure': self.structure,
            'client_logo': self.client_logo,
            'auditor_logo': self.auditor_logo,
            'header_alignment': self.header_alignment,
            'show_client_logo': self.show_client_logo,
            'show_auditor_logo': self.show_auditor_logo,
            'start_page_num': self.start_page_num
        }
"""

if 'class SystemChangelog' not in content:
    content = content.replace("class FindingTemplate(db.Model):", models + "\nclass FindingTemplate(db.Model):")

routes = """
# System Changelog APIs
@app.route('/api/changelogs', methods=['GET', 'POST'])
@login_required
def api_changelogs():
    if request.method == 'GET':
        logs = SystemChangelog.query.order_by(SystemChangelog.created_at.desc()).all()
        return jsonify([l.to_dict() for l in logs])
    elif request.method == 'POST':
        data = request.json
        log = SystemChangelog(
            version=data.get('version'),
            date=data.get('date'),
            description=data.get('description')
        )
        db.session.add(log)
        db.session.commit()
        return jsonify(log.to_dict())

@app.route('/api/changelogs/<int:id>', methods=['DELETE'])
@login_required
def api_changelog_delete(id):
    log = SystemChangelog.query.get_or_404(id)
    db.session.delete(log)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

# Report Template APIs
@app.route('/api/report_templates', methods=['GET', 'POST'])
@login_required
def api_report_templates():
    if request.method == 'GET':
        tpls = ReportTemplate.query.order_by(ReportTemplate.created_at.desc()).all()
        return jsonify([t.to_dict() for t in tpls])
    elif request.method == 'POST':
        data = request.json
        tpl = ReportTemplate(
            name=data.get('name'),
            template_type=data.get('template_type'),
            default_title=data.get('default_title'),
            classification=data.get('classification'),
            background_text=data.get('background_text'),
            methodology_text=data.get('methodology_text'),
            footer_text=data.get('footer_text'),
            structure=data.get('structure'),
            client_logo=data.get('client_logo'),
            auditor_logo=data.get('auditor_logo'),
            header_alignment=data.get('header_alignment'),
            show_client_logo=data.get('show_client_logo'),
            show_auditor_logo=data.get('show_auditor_logo'),
            start_page_num=data.get('start_page_num')
        )
        db.session.add(tpl)
        db.session.commit()
        return jsonify(tpl.to_dict())

@app.route('/api/report_templates/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def api_report_template_detail(id):
    tpl = ReportTemplate.query.get_or_404(id)
    if request.method == 'GET':
        return jsonify(tpl.to_dict())
    elif request.method == 'PUT':
        data = request.json
        tpl.name = data.get('name', tpl.name)
        tpl.template_type = data.get('template_type', tpl.template_type)
        tpl.default_title = data.get('default_title', tpl.default_title)
        tpl.classification = data.get('classification', tpl.classification)
        tpl.background_text = data.get('background_text', tpl.background_text)
        tpl.methodology_text = data.get('methodology_text', tpl.methodology_text)
        tpl.footer_text = data.get('footer_text', tpl.footer_text)
        tpl.structure = data.get('structure', tpl.structure)
        tpl.client_logo = data.get('client_logo', tpl.client_logo)
        tpl.auditor_logo = data.get('auditor_logo', tpl.auditor_logo)
        tpl.header_alignment = data.get('header_alignment', tpl.header_alignment)
        tpl.show_client_logo = data.get('show_client_logo', tpl.show_client_logo)
        tpl.show_auditor_logo = data.get('show_auditor_logo', tpl.show_auditor_logo)
        tpl.start_page_num = data.get('start_page_num', tpl.start_page_num)
        db.session.commit()
        return jsonify(tpl.to_dict())
    elif request.method == 'DELETE':
        db.session.delete(tpl)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
"""

if '@app.route(\'/api/changelogs\'' not in content:
    content = content.replace("@app.route('/', defaults={'path': ''})", routes + "\n@app.route('/', defaults={'path': ''})")

with open('app.py', 'w') as f:
    f.write(content)
