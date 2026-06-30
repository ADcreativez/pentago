import sqlite3
from datetime import datetime

with sqlite3.connect('pentago.db') as conn:
    cursor = conn.cursor()
    version = 'v1.1.0'
    date_str = datetime.utcnow().strftime('%Y-%m-%d')
    description = 'Implemented dynamic WordPress-style Word Processor for all Report Workspace chapters and sub-chapters, including a Save All feature.'
    
    cursor.execute("""
        INSERT INTO system_changelog (version, date, description, created_at)
        VALUES (?, ?, ?, ?)
    """, (version, date_str, description, datetime.utcnow()))
    
    conn.commit()
    print("Changelog added successfully!")
