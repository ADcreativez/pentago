import sqlite3
import json

conn = sqlite3.connect('pentago.db')
cur = conn.cursor()
cur.execute("SELECT technical_report FROM project WHERE id=5")
row = cur.fetchone()
if row and row[0]:
    tr = json.loads(row[0])
    for sec in tr:
        if sec['id'] == 'sec-1':
            for sub in sec.get('subsections', []):
                if sub['id'] == 'sub-1-6':
                    content = sub.get('content', '')
                    print("CONTENT EXACT:")
                    print(repr(content[:100]))
                    break
