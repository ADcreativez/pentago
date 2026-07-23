import sqlite3, json
conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT id, technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[1]:
    data = json.loads(row[1])
    for ch in data:
        if ch.get('title') and 'Appendix' in ch.get('title'):
            print("Content:")
            print(ch.get('content'))
