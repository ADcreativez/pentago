import sqlite3, json
conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT technical_report FROM project WHERE id = 5")
row = c.fetchone()
if row and row[0]:
    data = json.loads(row[0])
    for ch in data:
        if ch.get('title') and 'Appendix A' in ch.get('title'):
            print("Content:", ch.get('content')[-200:])
