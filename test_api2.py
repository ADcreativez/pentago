from app import app
with app.app_context():
    from app import ReportTemplate
    print("ReportTemplate count:", ReportTemplate.query.count())
