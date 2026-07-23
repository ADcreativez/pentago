import sqlite3
import json
conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, name, technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row:
    print(f"Project: {row[1]}")
    if row[2]:
        data = json.loads(row[2])
        for ch in data:
            if 'content' in ch and 'metodologi' in ch['content'].lower():
                print(f"Content: {ch['content']}")
            if 'subsections' in ch:
                for sub in ch['subsections']:
                    if 'content' in sub and 'metodologi' in sub['content'].lower():
                        print(f"SubContent: {sub['content']}")
