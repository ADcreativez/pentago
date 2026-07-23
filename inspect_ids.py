import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[0]:
    data = json.loads(row[0])
    for ch in data:
        print(f"Chapter: {ch.get('id')} - {ch.get('title')}")
