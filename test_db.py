from app import app, db, Company
import traceback

with app.app_context():
    try:
        companies = Company.query.all()
        for c in companies:
            print(f"Company: {c.name}")
            c.to_dict()
        print("Success")
    except Exception as e:
        print("ERROR:")
        traceback.print_exc()
