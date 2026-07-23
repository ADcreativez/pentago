import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, technical_report FROM project")
for row in c.fetchall():
    if not row[1]: continue
    data = json.loads(row[1])
    for ch in data:
        if ch.get('title') and 'Appendix A' in ch.get('title'):
            print(f"Project ID {row[0]}")
            print("Content:", ch.get('content'))
