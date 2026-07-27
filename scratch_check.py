from app import app, db, Company
with app.app_context():
    try:
        companies = Company.query.all()
        for c in companies:
            c.to_dict()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
