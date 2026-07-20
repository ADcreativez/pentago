import sqlite3
import json

db_path = 'pentago.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

def update_table(table_name):
    c.execute(f"SELECT id, technical_report FROM {table_name}")
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
                    chapter['content'] = """<table class="tbl">
        <thead><tr><th style="text-align:center;">CVSS Score</th><th style="text-align:center;">Severity</th><th>Definition</th></tr></thead>
        <tbody>
            <tr>
                <td style="font-weight:700; text-align:center;">0.0</td>
                <td style="text-align:center; font-weight:700; background-color:#f8fafc; color:#64748b;">NONE</td>
                <td>Peluang eksploitasi tidak ada atau tidak relevan.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">0.1 - 3.9</td>
                <td style="text-align:center; font-weight:700; background-color:#4ade80; color:#14532d;">LOW</td>
                <td>Eksploitasi membutuhkan akses lokal atau interaksi pengguna yang tinggi.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">4.0 - 6.9</td>
                <td style="text-align:center; font-weight:700; background-color:#facc15; color:#713f12;">MEDIUM</td>
                <td>Eksploitasi mungkin terjadi, namun dengan prasyarat tertentu.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">7.0 - 8.9</td>
                <td style="text-align:center; font-weight:700; background-color:#fb923c; color:#7c2d12;">HIGH</td>
                <td>Eksploitasi mudah dan sering terjadi dari jarak jauh tanpa otentikasi.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">9.0 - 10.0</td>
                <td style="text-align:center; font-weight:700; background-color:#f87171; color:#7f1d1d;">CRITICAL</td>
                <td>Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.</td>
            </tr>
        </tbody>
    </table>"""
                    modified = True
                
                if 'subsections' in chapter:
                    for sub in chapter['subsections']:
                        if sub.get('id') == 'sub-2-1':
                            sub['content'] = """<table class="tbl">
        <thead><tr><th style="text-align:center;">CVSS Score</th><th style="text-align:center;">Severity</th><th>Definition</th></tr></thead>
        <tbody>
            <tr>
                <td style="font-weight:700; text-align:center;">0.0</td>
                <td style="text-align:center; font-weight:700; background-color:#f8fafc; color:#64748b;">NONE</td>
                <td>Peluang eksploitasi tidak ada atau tidak relevan.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">0.1 - 3.9</td>
                <td style="text-align:center; font-weight:700; background-color:#4ade80; color:#14532d;">LOW</td>
                <td>Eksploitasi membutuhkan akses lokal atau interaksi pengguna yang tinggi.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">4.0 - 6.9</td>
                <td style="text-align:center; font-weight:700; background-color:#facc15; color:#713f12;">MEDIUM</td>
                <td>Eksploitasi mungkin terjadi, namun dengan prasyarat tertentu.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">7.0 - 8.9</td>
                <td style="text-align:center; font-weight:700; background-color:#fb923c; color:#7c2d12;">HIGH</td>
                <td>Eksploitasi mudah dan sering terjadi dari jarak jauh tanpa otentikasi.</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">9.0 - 10.0</td>
                <td style="text-align:center; font-weight:700; background-color:#f87171; color:#7f1d1d;">CRITICAL</td>
                <td>Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.</td>
            </tr>
        </tbody>
    </table>"""
                            modified = True
                            
            if modified:
                c.execute(f"UPDATE {table_name} SET technical_report = ? WHERE id = ?", (json.dumps(report), row_id))
                print(f"Updated {table_name} id {row_id}")
        except json.JSONDecodeError:
            pass

update_table('project')
update_table('report_template')

conn.commit()
conn.close()
print("Done")
