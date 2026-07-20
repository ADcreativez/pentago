import sqlite3
import json

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, technical_report FROM project WHERE name LIKE '%Pentest Mobile new%'")
row = c.fetchone()
if row:
    pid, report_json = row
    
    tools = 'Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb'
    tools_list = [t.strip() for t in tools.split(',')]
    
    col1 = "".join([f"<div>{t}</div>" for t in tools_list[:4]])
    col2 = "".join([f"<div>{t}</div>" for t in tools_list[4:9]])
    col3 = "".join([f"<div>{t}</div>" for t in tools_list[9:]])
    
    new_html = f"""<table class="tbl"><thead><tr><th style="padding:12px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:white; background:#1e3a5f;">Information Gathering</th><th style="padding:12px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:white; background:#1e3a5f;">Assessment</th><th style="padding:12px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:white; background:#1e3a5f;">Exploit/Tools</th></tr></thead><tbody><tr><td style="vertical-align:top; border:1px solid #cbd5e1; padding:12px;">{col1}</td><td style="vertical-align:top; border:1px solid #cbd5e1; padding:12px;">{col2}</td><td style="vertical-align:top; border:1px solid #cbd5e1; padding:12px;">{col3}</td></tr></tbody></table>"""
    
    if report_json:
        data = json.loads(report_json)
        for sec in data:
            if 'subsections' in sec:
                for sub in sec['subsections']:
                    if sub.get('id') == 'sub-2-2':
                        sub['content'] = new_html
        
        updated_json = json.dumps(data)
        c.execute("UPDATE project SET technical_report = ? WHERE id = ?", (updated_json, pid))
        conn.commit()
        print("Fixed sub-2-2 database with correct tools!")

conn.close()
