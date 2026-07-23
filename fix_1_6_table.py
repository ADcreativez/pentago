import sqlite3
import json

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

correct_table_html = """<table class="tbl" style="width:100%; border-collapse:collapse; font-size:9.5pt; margin:1.5rem 0;">
    <thead>
        <tr>
            <th style="background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #cbd5e1; text-align:center;">No.</th>
            <th style="background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #cbd5e1; text-align:center;">ID</th>
            <th style="background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #cbd5e1; text-align:center;">OWASP Testing Name</th>
            <th style="background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #cbd5e1; text-align:center;">Result Pass</th>
            <th style="background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #cbd5e1; text-align:center;">Issues</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">1</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A01:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Broken Access Control</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">2</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A02:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Cryptographic Failures</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">3</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A03:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Injection</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">4</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A04:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Insecure Design</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">5</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A05:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Security Misconfiguration</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">6</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A06:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Vulnerable and Outdated Components</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">7</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A07:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Identification and Authentication Failures</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">8</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A08:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Software and Data Integrity Failures</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">9</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A09:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Security Logging and Monitoring Failures</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;">10</td>
            <td style="font-weight:700; color:#1e3a5f; text-align:center; padding:8px; border:1px solid #cbd5e1;">A10:2021</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Server-Side Request Forgery (SSRF)</td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1;"><span style="color:#16a34a; font-weight:bold; font-size:1.1rem;">&#10003;</span></td>
            <td style="text-align:center; padding:8px; border:1px solid #cbd5e1; font-weight:bold;">-</td>
        </tr>
    </tbody>
</table>"""

def update_table(table_name, col_name):
    c.execute(f"SELECT id, {col_name} FROM {table_name}")
    rows = c.fetchall()
    for row in rows:
        row_id, report_str = row
        if not report_str: continue
        try:
            report = json.loads(report_str)
            modified = False
            for chapter in report:
                if 'subsections' in chapter:
                    for sub in chapter['subsections']:
                        if sub.get('id') == 'sub-1-6':
                            sub['content'] = correct_table_html
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
print("Done")
