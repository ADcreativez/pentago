with open('app.py', 'r') as f:
    content = f.read()

settings_model = """
class SystemSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(EncryptedText)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

"""

if 'class SystemSettings(db.Model):' not in content:
    content = content.replace('class SystemChangelog(db.Model):', settings_model + 'class SystemChangelog(db.Model):')
    with open('app.py', 'w') as f:
        f.write(content)
    print("Added SystemSettings model")
else:
    print("SystemSettings already exists")
