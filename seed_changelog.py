from app import app, db, SystemChangelog
from datetime import datetime, timedelta

def seed_logs():
    with app.app_context():
        logs = [
            ("1.0.0", "Initial Release of PentaGO System with core project and finding management.", 30),
            ("1.0.1", "Added user role constraints (Admin, Team Leader, Consultant, Sales).", 25),
            ("1.0.2", "Implemented automated CVSS Calculator for Findings.", 20),
            ("1.0.3", "Added Threat Modeling UI and Dashboard summary charts.", 18),
            ("1.0.4", "Integrated WeasyPrint engine for high-quality PDF Report Generation.", 15),
            ("1.0.5", "Fixed bugs related to image uploads and Markdown parsing in findings.", 12),
            ("1.0.6", "Added Document Control & Revision History feature to PDF Reports.", 10),
            ("1.0.7", "Added custom Page Formatting and Margins for PDF engine.", 5),
            ("1.0.8", "Implemented Client Approvals section in Project Workspace.", 2),
            ("1.0.9", "Added Spacing Selection feature (1.0 to 1.8) for Report Preview.", 0)
        ]

        for version, desc, days_ago in logs:
            date_str = (datetime.utcnow() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            new_log = SystemChangelog(version=version, description=desc, date=date_str)
            db.session.add(new_log)
        
        db.session.commit()
        print("Successfully seeded 10 changelog entries!")

if __name__ == '__main__':
    seed_logs()
