import urllib.request
import json
import subprocess

try:
    p_req = urllib.request.urlopen('http://127.0.0.1:5000/api/projects/5')
    p_data = p_req.read().decode('utf-8')
    f_req = urllib.request.urlopen('http://127.0.0.1:5000/api/findings?project_id=5')
    f_data = f_req.read().decode('utf-8')
except Exception as e:
    print("Fetch error:", e)
    exit(1)

script = f"""
try {{
    var content = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js', 4, null));
    eval(content);
    var p = {p_data};
    var findings = {f_data};
    var res = _buildPreviewDocument(p, findings, null, [], 'id', false, 1.4);
    if (res === undefined) {{
        console.log("RESULT IS UNDEFINED!");
    }} else {{
        console.log("RESULT TYPE:", typeof res);
        console.log("RESULT LENGTH:", res.length);
    }}
}} catch(e) {{
    console.log("ERROR:", e.toString());
}}
"""

with open('scratch/run_osascript.js', 'w') as f:
    f.write(script)

subprocess.run(['osascript', '-l', 'JavaScript', 'scratch/run_osascript.js'])
