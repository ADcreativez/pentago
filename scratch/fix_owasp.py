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
                    if sub.get('id') == 'sub-1-6':
                        sub['content'] = """<table class="tbl"><thead><tr><th>No</th><th style="font-weight:700;color:#1e3a5f;">OWASP Category</th><th>Description</th><th style="text-align:center;">Pass</th><th style="text-align:center;">Issue</th></tr></thead><tbody><tr><td>1</td><td style="font-weight:700;color:#1e3a5f;">A01:2021</td><td>Broken Access Control</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#dc2626;">✓</span></td></tr><tr><td>2</td><td style="font-weight:700;color:#1e3a5f;">A02:2021</td><td>Cryptographic Failures</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>3</td><td style="font-weight:700;color:#1e3a5f;">A03:2021</td><td>Injection</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>4</td><td style="font-weight:700;color:#1e3a5f;">A04:2021</td><td>Insecure Design</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>5</td><td style="font-weight:700;color:#1e3a5f;">A05:2021</td><td>Security Misconfiguration</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>6</td><td style="font-weight:700;color:#1e3a5f;">A06:2021</td><td>Vulnerable and Outdated Components</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>7</td><td style="font-weight:700;color:#1e3a5f;">A07:2021</td><td>Identification and Authentication Failures</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>8</td><td style="font-weight:700;color:#1e3a5f;">A08:2021</td><td>Software and Data Integrity Failures</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>9</td><td style="font-weight:700;color:#1e3a5f;">A09:2021</td><td>Security Logging and Monitoring Failures</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr><tr><td>10</td><td style="font-weight:700;color:#1e3a5f;">A10:2021</td><td>Server-Side Request Forgery (SSRF)</td><td style="text-align:center;font-size:1.1rem;font-weight:bold;"><span style="color:#16a34a;">✓</span></td><td style="text-align:center;font-size:1.1rem;font-weight:bold;">-</td></tr></tbody></table>"""
        
        updated_json = json.dumps(data)
        c.execute("UPDATE project SET technical_report = ? WHERE id = ?", (updated_json, pid))
        conn.commit()
        print("Fixed sub-1-6 database!")

conn.close()
