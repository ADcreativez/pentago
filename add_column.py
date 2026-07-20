import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'pentago.db')
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE project ADD COLUMN main_cover_logo VARCHAR(500);")
        conn.commit()
        print("Column main_cover_logo added successfully.")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
    conn.close()
