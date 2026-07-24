import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pentago.db')

def update_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    columns_to_add_project = [
        ("customer_pic", "VARCHAR(150)"),
        ("mandays", "FLOAT DEFAULT 0.0")
    ]
    
    for col_name, col_type in columns_to_add_project:
        try:
            c.execute(f"ALTER TABLE project ADD COLUMN {col_name} {col_type};")
            conn.commit()
            print(f"Success: Column '{col_name}' added to project.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Info: Column '{col_name}' already exists in project.")
            else:
                print(f"Error adding '{col_name}' to project: {e}")
                
    # Add sales_name to company table
    try:
        c.execute("ALTER TABLE company ADD COLUMN sales_name VARCHAR(150);")
        conn.commit()
        print("Success: Column 'sales_name' added to company.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Info: Column 'sales_name' already exists in company.")
        else:
            print(f"Error adding 'sales_name' to company: {e}")
                
    conn.close()

if __name__ == '__main__':
    update_db()
