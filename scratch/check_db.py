import os
from app import app, db, Project, ReportTemplate

with app.app_context():
    print("--- Report Templates ---")
    for t in ReportTemplate.query.all():
        print(f"ID: {t.id}, Name: {t.name}, Structure Length: {len(t.structure or '')}")
        
    print("\n--- Projects ---")
    for p in Project.query.all():
        print(f"ID: {p.id}, Name: {p.name}, Template ID: {p.report_template_id}")
