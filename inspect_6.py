import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()
c.execute("SELECT technical_report FROM project ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row and row[0]:
    data = json.loads(row[0])
    for ch in data:
        if ch.get('id') == 'sec-6':
            print("Found sec-6:")
            content = ch.get('content', '')
            print("Length:", len(content))
            if '<table' in content:
                print("CONTAINS <table!")
                idx = content.find('<table')
                print("Context around <table:", content[max(0, idx-20):idx+20])
            else:
                print("DOES NOT contain <table")
            break
