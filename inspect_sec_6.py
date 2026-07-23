import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[0]:
    data = json.loads(row[0])
    for ch in data:
        if ch.get('title') and 'Appendix A' in ch.get('title'):
            print("Found Chapter:", ch.get('title'))
            content = ch.get('content', '')
            print("Content:", content[:200])
            print("Has <table:", '<table' in content)
            break
