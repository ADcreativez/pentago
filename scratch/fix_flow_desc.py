import sqlite3

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("UPDATE project SET flow_description = NULL WHERE name LIKE '%Pentest Mobile new%'")
conn.commit()
print("Updated flow_description to NULL for project")
conn.close()
