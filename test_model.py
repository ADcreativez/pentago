from app import db
print("ReportTemplate exists:", 'report_template' in db.metadata.tables)
