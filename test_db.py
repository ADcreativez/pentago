from app import app, db
import sqlite3

try:
    with sqlite3.connect('pentago.db') as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(project)")
        cols = [c[1] for c in cursor.fetchall()]
        
        for new_col in ['report_version', 'report_date', 'report_author', 'change_reference', 'client_approver_name']:
            if new_col not in cols:
                print(f"Adding column {new_col}...")
                col_type = "VARCHAR(150)" if new_col in ['report_version', 'report_date', 'report_author'] else "TEXT"
                cursor.execute(f"ALTER TABLE project ADD COLUMN {new_col} {col_type}")
        print("Done!")
except Exception as e:
    print("Error:", e)
