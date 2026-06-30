from app import app, db
import sqlite3

try:
    with sqlite3.connect('pentago.db') as conn:
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE project ADD COLUMN exec_summary TEXT")
        cursor.execute("ALTER TABLE project ADD COLUMN methodology_text TEXT")
        print("Columns added successfully!")
except Exception as e:
    print("Error:", e)
