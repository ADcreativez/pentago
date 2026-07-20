import sqlite3
import json
import re

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

def replace_text_align_in_html(html_str):
    if not html_str:
        return html_str
    
    # regex matches <th ... style="... ">
    def replacer(match):
        th_attrs = match.group(1)
        if 'style="' in th_attrs:
            # Replace all occurrences of text-align:left; or text-align: left; with text-align:center;
            new_attrs = re.sub(r'text-align\s*:\s*left\s*;?', 'text-align:center;', th_attrs)
            return f'<th {new_attrs}>'
        return match.group(0)
    
    return re.sub(r'<th\s+([^>]+)>', replacer, html_str)

def update_table(table_name, col_name):
    c.execute(f"SELECT id, {col_name} FROM {table_name}")
    rows = c.fetchall()
    
    for row in rows:
        row_id, data_str = row
        if not data_str:
            continue
        try:
            data = json.loads(data_str)
            modified = False
            
            for chapter in data:
                if 'content' in chapter and chapter['content']:
                    old_content = chapter['content']
                    new_content = replace_text_align_in_html(old_content)
                    if old_content != new_content:
                        chapter['content'] = new_content
                        modified = True
                
                if 'subsections' in chapter:
                    for sub in chapter['subsections']:
                        if 'content' in sub and sub['content']:
                            old_content = sub['content']
                            new_content = replace_text_align_in_html(old_content)
                            if old_content != new_content:
                                sub['content'] = new_content
                                modified = True
                            
            if modified:
                c.execute(f"UPDATE {table_name} SET {col_name} = ? WHERE id = ?", (json.dumps(data), row_id))
                print(f"Updated {table_name} id {row_id}")
        except json.JSONDecodeError:
            pass

update_table('project', 'technical_report')
update_table('report_template', 'structure')

conn.commit()
conn.close()
