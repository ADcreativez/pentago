import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pentago.db')

def update_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # We will try to add ALL columns that might be missing just to be absolutely sure.
    columns_to_add_project = [
        ("customer_pic", "VARCHAR(150)"),
        ("mandays", "FLOAT DEFAULT 0.0"),
        ("report_template_id", "INTEGER"),
        ("sales_id", "INTEGER"),
        ("cover_title_2", "VARCHAR(250)"),
        ("main_cover_logo", "VARCHAR(500)"),
        ("technical_report", "TEXT"),
        ("is_approved", "BOOLEAN DEFAULT 0"),
        ("use_watermark", "BOOLEAN DEFAULT 1"),
        ("auditor_logo", "VARCHAR(500)")
    ]
    
    for col_name, col_type in columns_to_add_project:
        try:
            c.execute(f"ALTER TABLE project ADD COLUMN {col_name} {col_type};")
            conn.commit()
            print(f"Success: Column '{col_name}' added to project.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                pass
            else:
                print(f"Error adding '{col_name}' to project: {e}")
                
    # Add sales_name to company table
    try:
        c.execute("ALTER TABLE company ADD COLUMN sales_name VARCHAR(150);")
        conn.commit()
        print("Success: Column 'sales_name' added to company.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            pass
        else:
            print(f"Error adding 'sales_name' to company: {e}")

    # Ensure Finding table has latest columns
    columns_to_add_finding = [
        ("poc_image_align", "VARCHAR(50) DEFAULT 'center'"),
        ("poc_image_caption", "VARCHAR(250)"),
        ("finding_status", "VARCHAR(50) DEFAULT 'Open'"),
        ("cvss_version", "VARCHAR(10) DEFAULT 'v3.1'"),
        ("iso_27001", "VARCHAR(150)"),
        ("nist_control", "VARCHAR(150)"),
        ("ptes_phase", "VARCHAR(100)")
    ]

    for col_name, col_type in columns_to_add_finding:
        try:
            c.execute(f"ALTER TABLE finding ADD COLUMN {col_name} {col_type};")
            conn.commit()
            print(f"Success: Column '{col_name}' added to finding.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                pass
            else:
                print(f"Error adding '{col_name}' to finding: {e}")
                
    conn.close()

if __name__ == '__main__':
    update_db()
