import re

with open('app.py', 'r') as f:
    content = f.read()

# 1. Remove Git APIs
content = re.sub(r"@app\.route\('/api/admin/git-log'.*?@app\.route\('/api/admin/users'", "@app.route('/api/admin/users'", content, flags=re.DOTALL)

# 2. Add SystemChangelog Model
model_code = """
class SystemChangelog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'date': self.date,
            'description': self.description
        }
"""
if 'class SystemChangelog' not in content:
    content = content.replace("class BlockedIP(db.Model):", model_code + "\nclass BlockedIP(db.Model):")

# 3. Add Changelog APIs
api_code = """
@app.route('/api/admin/changelogs', methods=['GET', 'POST'])
@login_required
def manage_changelogs():
    if session.get('role') != 'Admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        logs = SystemChangelog.query.order_by(SystemChangelog.id.desc()).all()
        return jsonify([l.to_dict() for l in logs])
    
    if request.method == 'POST':
        data = request.json
        new_log = SystemChangelog(
            version=data.get('version', '1.0'),
            date=data.get('date', datetime.utcnow().strftime('%Y-%m-%d')),
            description=data.get('description', '')
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify(new_log.to_dict()), 201

@app.route('/api/admin/changelogs/<int:log_id>', methods=['DELETE'])
@login_required
def delete_changelog(log_id):
    if session.get('role') != 'Admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    log = SystemChangelog.query.get(log_id)
    if not log:
        return jsonify({'message': 'Not found'}), 404
        
    db.session.delete(log)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
"""
if '/api/admin/changelogs' not in content:
    content = content.replace("@app.route('/api/admin/users'", api_code + "\n\n@app.route('/api/admin/users'")

with open('app.py', 'w') as f:
    f.write(content)
