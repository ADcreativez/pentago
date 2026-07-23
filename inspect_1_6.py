import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[1]:
    data = json.loads(row[1])
    for ch in data:
        if 'subsections' in ch:
            for sub in ch['subsections']:
                if sub.get('id') == 'sub-1-6':
                    print("Found 1.6 in project:")
                    print(sub.get('content')[:1000])
                    break
