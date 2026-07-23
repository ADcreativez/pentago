import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[0]:
    data = json.loads(row[0])
    for ch in data:
        if 'subsections' in ch:
            for sub in ch['subsections']:
                if sub.get('id') == 'sub-1-6':
                    content = sub.get('content')
                    print(content)
                    break
