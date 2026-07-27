from app import app, db, Company, Project
with app.app_context():
    try:
        company = Company(name="Test Company", industry="IT", sales_name="Sales")
        db.session.add(company)
        db.session.commit()
        print("Company dict:", company.to_dict())
        
        project = Project(name="Test Project", company_id=company.id, po_number="123")
        db.session.add(project)
        db.session.commit()
        print("Project dict:", project.to_dict())
        
        db.session.delete(project)
        db.session.delete(company)
        db.session.commit()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
