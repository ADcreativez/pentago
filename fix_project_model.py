import re

with open('app.py', 'r') as f:
    content = f.read()

# Add columns to Project model
if 'cover_logo = db.Column(db.String(500))' not in content:
    content = re.sub(r'(created_at = db.Column\(db.DateTime, default=datetime.utcnow\))',
                     r'\1\n    cover_logo = db.Column(db.String(500))\n    client_logo = db.Column(db.String(500))\n    header_text = db.Column(db.String(250))\n    footer_text = db.Column(db.String(250))',
                     content)

# Add columns to to_dict
if "'cover_logo': self.cover_logo" not in content:
    content = re.sub(r"('client_approver_name': self.client_approver_name,)",
                     r"\1\n            'cover_logo': self.cover_logo,\n            'client_logo': self.client_logo,\n            'header_text': self.header_text,\n            'footer_text': self.footer_text,",
                     content)

# Add migrations
migration_block = """    try:
        db.session.execute(text("ALTER TABLE project ADD COLUMN cover_logo VARCHAR(500)"))
        db.session.commit()
    except Exception:
        db.session.rollback()
    try:
        db.session.execute(text("ALTER TABLE project ADD COLUMN client_logo VARCHAR(500)"))
        db.session.commit()
    except Exception:
        db.session.rollback()
    try:
        db.session.execute(text("ALTER TABLE project ADD COLUMN header_text VARCHAR(250)"))
        db.session.commit()
    except Exception:
        db.session.rollback()
    try:
        db.session.execute(text("ALTER TABLE project ADD COLUMN footer_text VARCHAR(250)"))
        db.session.commit()
    except Exception:
        db.session.rollback()"""

if 'ALTER TABLE project ADD COLUMN cover_logo' not in content:
    content = re.sub(r'(db.create_all\(\)\n    from sqlalchemy import text)', r'\1\n' + migration_block, content)

with open('app.py', 'w') as f:
    f.write(content)

