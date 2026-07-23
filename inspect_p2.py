import sqlite3
import json
conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT technical_report FROM project WHERE id=7")
row = c.fetchone()
if row and row[0]:
    data = json.loads(row[0])
    for ch in data:
        if 'subsections' in ch:
            for sub in ch['subsections']:
                if '2.1' in sub.get('title', ''):
                    print("--- 2.1 CONTENT ---")
                    print(sub.get('content'))
                if '2.2' in sub.get('title', ''):
                    print("--- 2.2 CONTENT ---")
                    print(sub.get('content'))
