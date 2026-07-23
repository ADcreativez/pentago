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
            print(f"Project ID {row[0]}, Chapter: {ch.get('title')}")
            content = ch.get('content', '')
            print("Has <table:", '<table' in content)
            if '<table' in content:
                print("Table index:", content.find('<table'))
                print("Context:", content[max(0, content.find('<table')-20):content.find('<table')+20])
