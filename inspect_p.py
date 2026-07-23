import sqlite3
import json
conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, name, technical_report FROM project ORDER BY id DESC LIMIT 2")
rows = c.fetchall()
for row in rows:
    print(f"Project ID: {row[0]}, Name: {row[1]}")
    if row[2]:
        try:
            data = json.loads(row[2])
            for ch in data:
                if '2.' in ch.get('title', ''):
                    print(f"  CH: {ch.get('title')}")
                if 'subsections' in ch:
                    for sub in ch['subsections']:
                        if '2.1' in sub.get('title', '') or '2.2' in sub.get('title', ''):
                            print(f"    SUB: {sub.get('title')}")
                            # print(f"    CONTENT: {sub.get('content')[:100]}...")
        except Exception as e:
            print(e)
