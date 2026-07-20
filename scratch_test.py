import sqlite3
c = sqlite3.connect('pentago.db').cursor()
res = c.execute("SELECT id, is_approved FROM project LIMIT 1").fetchone()
print(res)
