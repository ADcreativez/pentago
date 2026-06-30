import re

with open('app.py', 'r') as f:
    content = f.read()

# Make sure subprocess is imported
if 'import subprocess' not in content:
    content = content.replace('import json', 'import json\nimport subprocess')

git_apis = """
@app.route('/api/admin/git-log', methods=['GET'])
@login_required
def get_git_log():
    if session.get('role') != 'Admin':
        return jsonify({'message': 'Unauthorized'}), 403
    try:
        # Get git logs
        result = subprocess.run(['git', 'log', '-n', '50', '--pretty=format:%h|%an|%ad|%s', '--date=short'], capture_output=True, text=True, check=True)
        logs = []
        for line in result.stdout.strip().split('\\n'):
            if line:
                parts = line.split('|', 3)
                if len(parts) == 4:
                    logs.append({
                        'hash': parts[0],
                        'author': parts[1],
                        'date': parts[2],
                        'message': parts[3]
                    })
        
        # Get current status
        status_res = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
        has_changes = len(status_res.stdout.strip()) > 0
        
        return jsonify({'logs': logs, 'has_changes': has_changes})
    except Exception as e:
        return jsonify({'message': 'Failed to read git log: ' + str(e)}), 500

@app.route('/api/admin/git-commit', methods=['POST'])
@login_required
def commit_current_version():
    if session.get('role') != 'Admin':
        return jsonify({'message': 'Unauthorized'}), 403
    data = request.json
    message = data.get('message', 'Update application state')
    author = session.get('username', 'Admin')
    try:
        subprocess.run(['git', 'add', '.'], check=True)
        # Commit using user as author
        subprocess.run(['git', 'commit', '-m', message, '--author', f'{author} <{author}@pentago.local>'], check=True)
        return jsonify({'message': 'Version saved successfully!'})
    except subprocess.CalledProcessError as e:
        # Check if it failed because there's nothing to commit
        status_res = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
        if len(status_res.stdout.strip()) == 0:
            return jsonify({'message': 'No changes to save.'}), 400
        return jsonify({'message': 'Failed to save version.'}), 500

@app.route('/api/admin/git-restore', methods=['POST'])
@login_required
def restore_app_version():
    if session.get('role') != 'Admin':
        return jsonify({'message': 'Unauthorized'}), 403
    data = request.json
    commit_hash = data.get('hash')
    if not commit_hash:
        return jsonify({'message': 'Commit hash required'}), 400
    try:
        subprocess.run(['git', 'reset', '--hard', commit_hash], check=True)
        subprocess.run(['git', 'clean', '-fd'], check=True)
        return jsonify({'message': 'Application restored successfully! Note: Application might restart.'})
    except subprocess.CalledProcessError as e:
        return jsonify({'message': 'Failed to restore version.'}), 500
"""

content = content.replace("@app.route('/api/admin/users', methods=['GET', 'POST'])", git_apis + "\n\n@app.route('/api/admin/users', methods=['GET', 'POST'])")

with open('app.py', 'w') as f:
    f.write(content)
