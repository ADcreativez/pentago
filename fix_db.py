import sqlite3
import json

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, technical_report FROM project WHERE name LIKE '%Pentest Mobile new%'")
row = c.fetchone()
if row:
    pid, report_json = row
    if report_json:
        data = json.loads(report_json)
        for sec in data:
            if 'subsections' in sec:
                for sub in sec['subsections']:
                    if sub.get('id') == 'sub-2-1':
                        sub['content'] = """<table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; margin-top:1rem;"><thead><tr style="background:#1e3a5f; color:white;"><th style="padding:12px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:white;">CVSS Score</th><th style="padding:12px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:white;">Severity</th><th style="padding:12px; border:1px solid #cbd5e1; text-align:left; font-weight:700; color:white;">Definition</th></tr></thead><tbody><tr><td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">0.0</td><td style="padding:12px; border:1px solid #cbd5e1;"><span class="badge badge-none" style="font-weight:bold; font-size:12px;">NONE</span></td><td style="padding:12px; border:1px solid #cbd5e1;">Tidak ada kerentanan yang ada.</td></tr><tr><td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">0.1 - 3.9</td><td style="padding:12px; border:1px solid #cbd5e1;"><span class="badge badge-low" style="font-weight:bold; font-size:12px;">LOW</span></td><td style="padding:12px; border:1px solid #cbd5e1;">Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan.</td></tr><tr><td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">4.0 - 6.9</td><td style="padding:12px; border:1px solid #cbd5e1;"><span class="badge badge-medium" style="font-weight:bold; font-size:12px;">MEDIUM</span></td><td style="padding:12px; border:1px solid #cbd5e1;">Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah tambahan.</td></tr><tr><td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">7.0 - 8.9</td><td style="padding:12px; border:1px solid #cbd5e1;"><span class="badge badge-high" style="font-weight:bold; font-size:12px;">HIGH</span></td><td style="padding:12px; border:1px solid #cbd5e1;">Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan kehilangan data.</td></tr><tr><td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">9.0 - 10.0</td><td style="padding:12px; border:1px solid #cbd5e1;"><span class="badge badge-critical" style="font-weight:bold; font-size:12px;">CRITICAL</span></td><td style="padding:12px; border:1px solid #cbd5e1;">Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.</td></tr></tbody></table>"""
        
        updated_json = json.dumps(data)
        c.execute("UPDATE project SET technical_report = ? WHERE id = ?", (updated_json, pid))
        conn.commit()
        print("Fixed database!")

conn.close()
