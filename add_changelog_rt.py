import sqlite3
from datetime import datetime

with sqlite3.connect('pentago.db') as conn:
    cursor = conn.cursor()
    version = 'v1.1.1'
    date_str = datetime.utcnow().strftime('%Y-%m-%d')
    description = 'Restored the Report Templates feature and integrated it smoothly with the new WordPress-style Editor Workspace.'
    
    cursor.execute("""
        INSERT INTO system_changelog (version, date, description, created_at)
        VALUES (?, ?, ?, ?)
    """, (version, date_str, description, datetime.utcnow()))
    
    conn.commit()
    print("Changelog added successfully!")
