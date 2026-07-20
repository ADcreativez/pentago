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
            
            new_table = """<table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #000;">
    <thead>
        <tr>
            <th style="text-align:center; background-color:#1e3a5f; color:#fff; font-style:italic; padding:8px; border:1px solid #000;">CVSS Score</th>
            <th style="text-align:center; background-color:#1e3a5f; color:#fff; font-style:italic; padding:8px; border:1px solid #000;">Severity</th>
            <th style="background-color:#1e3a5f; color:#fff; padding:8px; border:1px solid #000;">Definition</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #000;">0.0</td>
            <td style="text-align:center; font-weight:700; background-color:#00b0f0; color:#ffffff; font-style:italic; padding:8px; border:1px solid #000;">NONE</td>
            <td style="padding:8px; border:1px solid #000;">Tidak ada kerentanan yang ada. Informasi tambahan diberikan mengenai item yang diperhatikan selama pengujian, kontrol yang kuat, dan dokumentasi tambahan.</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #000;">0.1 - 3.9</td>
            <td style="text-align:center; font-weight:700; background-color:#00b050; color:#ffffff; font-style:italic; padding:8px; border:1px solid #000;">LOW</td>
            <td style="padding:8px; border:1px solid #000;">Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan organisasi. Disarankan untuk membentuk rencana tindakan dan tambalan selama jendela pemeliharaan berikutnya.</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #000;">4.0 - 6.9</td>
            <td style="text-align:center; font-weight:700; background-color:#ffc000; color:#ffffff; font-style:italic; padding:8px; border:1px solid #000;">MEDIUM</td>
            <td style="padding:8px; border:1px solid #000;">Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah-langkah tambahan seperti rekayasa sosial. Disarankan untuk membentuk rencana tindakan dan patch setelah masalah prioritas tinggi telah diselesaikan.</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #000;">7.0 - 8.9</td>
            <td style="text-align:center; font-weight:700; background-color:#c00000; color:#ffffff; font-style:italic; padding:8px; border:1px solid #000;">HIGH</td>
            <td style="padding:8px; border:1px solid #000;">Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan berpotensi kehilangan data atau waktu henti. Disarankan untuk membentuk rencana tindakan dan tambalan sesegera mungkin.</td>
        </tr>
        <tr>
            <td style="text-align:center; padding:8px; border:1px solid #000;">9.0 - 10.0</td>
            <td style="text-align:center; font-weight:700; background-color:#7030a0; color:#ffffff; font-style:italic; padding:8px; border:1px solid #000;">CRITICAL</td>
            <td style="padding:8px; border:1px solid #000;">Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem. Disarankan untuk membentuk rencana tindakan dan segera menambal.</td>
        </tr>
    </tbody>
</table>"""

            for chapter in report:
                if chapter.get('id') == 'sub-2-1':
                    chapter['content'] = new_table
                    modified = True
                
                if 'subsections' in chapter:
                    for sub in chapter['subsections']:
                        if sub.get('id') == 'sub-2-1':
                            sub['content'] = new_table
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
