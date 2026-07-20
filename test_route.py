from app import app, db, ReportTemplate
with app.app_context():
    try:
        with app.test_client() as c:
            # mock session
            with c.session_transaction() as sess:
                sess['user_id'] = 1
                sess['role'] = 'Admin'
            response = c.get('/api/report_templates')
            print("STATUS CODE:", response.status_code)
            print("RESPONSE:", response.data.decode('utf-8'))
    except Exception as e:
        print("EXCEPTION:", e)
