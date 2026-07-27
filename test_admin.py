from app import app, User, db
client = app.test_client()

with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print("No admin user")
    else:
        with client.session_transaction() as sess:
            sess['user_id'] = admin.id
            sess['username'] = admin.username
            sess['role'] = admin.role
        
        print("Testing GET /admin")
        res = client.get('/admin')
        print(f"Status: {res.status_code}")
        print("Success! No hang.")
