import traceback
from app import app, db, Company

with app.app_context():
    try:
        companies = Company.query.all()
        for c in companies:
            c.to_dict()
        print("Success! No error.")
    except Exception as e:
        print("ERROR FOUND:")
        traceback.print_exc()
