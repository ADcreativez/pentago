from app import app, db, Company, User
from werkzeug.security import generate_password_hash

app.config['TESTING'] = True
client = app.test_client()

with app.app_context():
    # Use the existing admin user in the database
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print("Admin user not found!")
        exit(1)
        
    with client.session_transaction() as sess:
        sess['user_id'] = admin.id
        sess['username'] = admin.username

    # Test POST
    print("Testing POST /api/companies")
    res = client.post('/api/companies', json={
        'name': 'Test Client',
        'industry': 'IT',
        'sales_name': 'John',
        'year': '2026'
    })
    print("POST status:", res.status_code)
    print("POST data:", res.get_data(as_text=True))
