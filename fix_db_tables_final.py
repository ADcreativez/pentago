from app import app, db, Project, ReportTemplate
import json

def get_new_2_1():
    return """
<table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; font-family:'Arimo',sans-serif; font-size:9.5pt; margin-bottom: 1.5rem;">
    <thead>
        <tr>
            <th style="width:15%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">CVSS Score</th>
            <th style="width:20%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">Severity</th>
            <th style="width:65%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">Definition</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">0.0</td>
            <td style="padding:10px; border:1px solid #e2e8f0;"><span style="background-color:#f1f5f9; color:#64748b; padding:4px 10px; border-radius:9999px; font-weight:bold; font-size:8pt; display:inline-block;">NONE</span></td>
            <td style="padding:10px; border:1px solid #e2e8f0;">Tidak ada kerentanan yang ada.</td>
        </tr>
        <tr>
            <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">0.1 - 3.9</td>
            <td style="padding:10px; border:1px solid #e2e8f0;"><span style="background-color:#ecfdf5; color:#10b981; padding:4px 10px; border-radius:9999px; font-weight:bold; font-size:8pt; display:inline-block;">LOW</span></td>
            <td style="padding:10px; border:1px solid #e2e8f0;">Kerentanan tidak dapat dieksploitasi tetapi akan mengurangi permukaan serangan.</td>
        </tr>
        <tr>
            <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">4.0 - 6.9</td>
            <td style="padding:10px; border:1px solid #e2e8f0;"><span style="background-color:#fff7ed; color:#f59e0b; padding:4px 10px; border-radius:9999px; font-weight:bold; font-size:8pt; display:inline-block;">MEDIUM</span></td>
            <td style="padding:10px; border:1px solid #e2e8f0;">Kerentanan ada tetapi tidak dapat dieksploitasi atau memerlukan langkah tambahan.</td>
        </tr>
        <tr>
            <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">7.0 - 8.9</td>
            <td style="padding:10px; border:1px solid #e2e8f0;"><span style="background-color:#fef2f2; color:#ef4444; padding:4px 10px; border-radius:9999px; font-weight:bold; font-size:8pt; display:inline-block;">HIGH</span></td>
            <td style="padding:10px; border:1px solid #e2e8f0;">Eksploitasi sulit tetapi dapat menyebabkan peningkatan hak istimewa dan kehilangan data.</td>
        </tr>
        <tr>
            <td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold;">9.0 - 10.0</td>
            <td style="padding:10px; border:1px solid #e2e8f0;"><span style="background-color:#f5f3ff; color:#8b5cf6; padding:4px 10px; border-radius:9999px; font-weight:bold; font-size:8pt; display:inline-block;">CRITICAL</span></td>
            <td style="padding:10px; border:1px solid #e2e8f0;">Eksploitasi sangat mudah dan biasanya menghasilkan kompromi tingkat sistem.</td>
        </tr>
    </tbody>
</table>
    """.strip()

def get_new_2_2(tools_str="Maltego, Dnsenum, Theharvester, Nmap, Nessus Pro, Nikto, w3af, Acunetix Pro, Zaproxy, Sqlmap, Metasploit, Burpsuite Pro, exploit-db, Dirb"):
    tools = [t.strip() for t in tools_str.split(',')]
    col1 = "<br>".join(tools[:4])
    col2 = "<br>".join(tools[4:9])
    col3 = "<br>".join(tools[9:])
    return f"""
<table class="tbl" style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; font-family:'Arimo',sans-serif; font-size:9.5pt; margin-bottom: 1.5rem;">
    <thead>
        <tr>
            <th style="width:33.33%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">Information Gathering</th>
            <th style="width:33.33%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">Assessment</th>
            <th style="width:33.33%; text-align:left; background-color:#1e3a5f; color:#fff; padding:10px; border:1px solid #e2e8f0;">Exploit/Tools</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding:10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6;">{col1}</td>
            <td style="padding:10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6;">{col2}</td>
            <td style="padding:10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6;">{col3}</td>
        </tr>
    </tbody>
</table>
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
            
    templates = ReportTemplate.query.all()
    for tpl in templates:
        if not tpl.structure: continue
        try:
            data = json.loads(tpl.structure)
            modified = False
            for ch in data:
                if 'subsections' in ch:
                    for sub in ch['subsections']:
                        if sub.get('id') == 'sub-2-1' or 'Risk Assessment' in sub.get('title', ''):
                            sub['content'] = get_new_2_1()
                            modified = True
                        if sub.get('id') == 'sub-2-2' or 'Penetration Testing Tools' in sub.get('title', ''):
                            sub['content'] = get_new_2_2()
                            modified = True
            if modified:
                tpl.structure = json.dumps(data)
                db.session.add(tpl)
        except Exception as e:
            print(f"Error on template {tpl.id}: {e}")
    
    db.session.commit()
    print("Database updated securely via Flask Context with Tables.")
