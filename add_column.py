import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pentago.db')
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE project ADD COLUMN mandays FLOAT DEFAULT 0.0;")
        conn.commit()
        print("Column mandays added successfully.")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
    conn.close()
