from app import app, db, ReportTemplate
with app.app_context():
    for t in ReportTemplate.query.all():
        print(t.to_dict())
