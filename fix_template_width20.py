import sqlite3
import json

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

def update_table(table_name, col_name):
    c.execute(f"SELECT id, {col_name} FROM {table_name}")
    rows = c.fetchall()
    
    for row in rows:
        row_id, report_str = row
        if not report_str:
            continue
        try:
            report = json.loads(report_str)
            modified = False
            
            for chapter in report:
                if chapter.get('id') == 'sub-2-1':
                    chapter['content'] = chapter['content'].replace('width:30%;', 'width:20%;').replace('width:50%;', 'width:60%;')
                    modified = True
                
                if 'subsections' in chapter:
                    for sub in chapter['subsections']:
                        if sub.get('id') == 'sub-2-1':
                            sub['content'] = sub['content'].replace('width:30%;', 'width:20%;').replace('width:50%;', 'width:60%;')
                            modified = True
                            
            if modified:
                c.execute(f"UPDATE {table_name} SET {col_name} = ? WHERE id = ?", (json.dumps(report), row_id))
                print(f"Updated {table_name} id {row_id}")
        except json.JSONDecodeError:
            pass

update_table('project', 'technical_report')
update_table('report_template', 'structure')

conn.commit()
conn.close()
