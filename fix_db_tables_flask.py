from app import app, db, Project, ReportTemplate
import json

def get_new_2_1():
    return """
<div style="margin-bottom: 1.5rem;">
    <div style="background-color: #00b0f0; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px 4px 0 0;">NONE (0.0)</div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: #fff;">Tidak ada kerentanan yang ada. Informasi tambahan diberikan mengenai item yang diperhatikan selama pengujian, kontrol yang kuat, dan dokumentasi tambahan.</div>
</div>
<div style="margin-bottom: 1.5rem;">
    <div style="background-color: #00b050; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px 4px 0 0;">LOW (0.1 - 3.9)</div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: #fff;">Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan organisasi. Disarankan untuk membentuk rencana tindakan dan tambalan selama jendela pemeliharaan berikutnya.</div>
</div>
<div style="margin-bottom: 1.5rem;">
    <div style="background-color: #ffc000; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px 4px 0 0;">MEDIUM (4.0 - 6.9)</div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: #fff;">Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah-langkah tambahan seperti rekayasa sosial. Disarankan untuk membentuk rencana tindakan dan patch setelah masalah prioritas tinggi telah diselesaikan.</div>
</div>
<div style="margin-bottom: 1.5rem;">
    <div style="background-color: #c00000; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px 4px 0 0;">HIGH (7.0 - 8.9)</div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: #fff;">Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan berpotensi kehilangan data atau waktu henti. Disarankan untuk membentuk rencana tindakan dan tambalan sesegera mungkin.</div>
</div>
<div style="margin-bottom: 1.5rem;">
    <div style="background-color: #7030a0; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px 4px 0 0;">CRITICAL (9.0 - 10.0)</div>
    <div style="border: 1px solid #e2e8f0; border-top: none; padding: 12px; border-radius: 0 0 4px 4px; background: #fff;">Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem. Disarankan untuk membentuk rencana tindakan dan segera menambal.</div>
</div>
    """.strip()

def get_new_2_2(tools_str="Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb"):
    tools = [t.strip() for t in tools_str.split(',')]
    col1 = tools[:4]
    col2 = tools[4:9]
    col3 = tools[9:]
    return f"""
<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 200px; margin-bottom: 1rem;">
        <h4 style="background: #1e3a5f; color: white; padding: 6px 12px; margin: 0; font-size: 10pt;">Information Gathering</h4>
        <ul style="border: 1px solid #e2e8f0; border-top: none; padding: 12px 12px 12px 28px; margin: 0; background: #f8fafc; font-size: 9.5pt;">
            {"".join(f"<li>{t}</li>" for t in col1)}
        </ul>
    </div>
    <div style="flex: 1; min-width: 200px; margin-bottom: 1rem;">
        <h4 style="background: #1e3a5f; color: white; padding: 6px 12px; margin: 0; font-size: 10pt;">Assessment</h4>
        <ul style="border: 1px solid #e2e8f0; border-top: none; padding: 12px 12px 12px 28px; margin: 0; background: #f8fafc; font-size: 9.5pt;">
            {"".join(f"<li>{t}</li>" for t in col2)}
        </ul>
    </div>
    <div style="flex: 1; min-width: 200px; margin-bottom: 1rem;">
        <h4 style="background: #1e3a5f; color: white; padding: 6px 12px; margin: 0; font-size: 10pt;">Exploit/Tools</h4>
        <ul style="border: 1px solid #e2e8f0; border-top: none; padding: 12px 12px 12px 28px; margin: 0; background: #f8fafc; font-size: 9.5pt;">
            {"".join(f"<li>{t}</li>" for t in col3)}
        </ul>
    </div>
</div>
    """.strip()

with app.app_context():
    projects = Project.query.all()
    for p in projects:
        if not p.technical_report: continue
        try:
            data = json.loads(p.technical_report)
            modified = False
            for ch in data:
                if 'subsections' in ch:
                    for sub in ch['subsections']:
                        if sub.get('id') == 'sub-2-1' or 'Risk Assessment' in sub.get('title', ''):
                            sub['content'] = get_new_2_1()
                            modified = True
                        if sub.get('id') == 'sub-2-2' or 'Penetration Testing Tools' in sub.get('title', ''):
                            tools = p.used_tools if p.used_tools else "Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb"
                            sub['content'] = get_new_2_2(tools)
                            modified = True
            if modified:
                p.technical_report = json.dumps(data)
                db.session.add(p)
        except Exception as e:
            print(f"Error on project {p.id}: {e}")
    
    db.session.commit()
    print("Database updated securely via Flask Context.")
