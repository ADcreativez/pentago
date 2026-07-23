import sqlite3
import json

conn = sqlite3.connect('pentago.db')
c = conn.cursor()

def check_table(table_name, col_name):
    c.execute(f"SELECT id, {col_name} FROM {table_name}")
    for row in c.fetchall():
        if not row[1]: continue
        data = json.loads(row[1])
        for ch in data:
            for sub in ch.get('subsections', []):
                if sub.get('id') == 'sub-1-6':
                    html = sub.get('content', '')
                    trs = html.count('<tr')
                    print(f"{table_name} id {row[0]}: {trs} tr tags")
                    if trs == 1 or trs == 2:
                        print("FLATTENED TABLE DETECTED!")

check_table('project', 'technical_report')
check_table('report_template', 'structure')
