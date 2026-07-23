import sqlite3
import json
conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, name, technical_report FROM project ORDER BY id DESC LIMIT 5")
rows = c.fetchall()
for row in rows:
    if row[2]:
        try:
            data = json.loads(row[2])
            for ch in data:
                if 'content' in ch and 'Berikut' in ch['content']:
                    print(f"P{row[0]} Content: {ch['content']}")
                if 'subsections' in ch:
                    for sub in ch['subsections']:
                        if 'content' in sub and 'Berikut' in sub['content']:
                            print(f"P{row[0]} SubContent: {sub['content']}")
        except: pass
