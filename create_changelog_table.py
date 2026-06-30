from app import app, db
import sqlite3

try:
    with sqlite3.connect('pentago.db') as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_changelog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version VARCHAR(50) NOT NULL,
            date VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Done creating system_changelog table!")
except Exception as e:
    print("Error:", e)
