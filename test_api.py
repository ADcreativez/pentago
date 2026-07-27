from app import app, db, Company, User
from werkzeug.security import generate_password_hash

app.config['TESTING'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
client = app.test_client()

with app.app_context():
    db.create_all()
    # Create an admin user
    admin = User(username='admin', password_hash=generate_password_hash('admin123'), role='Admin')
    db.session.add(admin)
    db.session.commit()

    with client.session_transaction() as sess:
        sess['user_id'] = admin.id
        sess['username'] = admin.username

    # Test GET
    print("Testing GET /api/companies")
    res = client.get('/api/companies')
    print("GET status:", res.status_code)
    print("GET data:", res.get_json())

    # Test POST
    print("Testing POST /api/companies")
    res = client.post('/api/companies', json={
        'name': 'Test Client',
        'industry': 'IT',
        'sales_name': 'John',
        'year': ''
    })
    print("POST status:", res.status_code)
    print("POST data:", res.get_data(as_text=True))
