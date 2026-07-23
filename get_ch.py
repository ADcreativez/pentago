import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[1]:
    data = json.loads(row[1])
    for ch in data:
        print(ch.get('title'), ch.get('content')[:100] if ch.get('content') else '')
