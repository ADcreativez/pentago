from app import app, Project
with app.app_context():
    p = Project.query.get(5)
    print("KEYS:", p.to_dict().keys())
    print("report_template_id:", p.to_dict().get('report_template_id'))
