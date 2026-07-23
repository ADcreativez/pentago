import re

def fix_appjs(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix openReportPreview
    if "const previewWin = window.open('', '_blank');" not in content:
        content = content.replace(
            "async function openReportPreview(lang = 'id') {\n",
            "async function openReportPreview(lang = 'id') {\n    const previewWin = window.open('', '_blank');\n    if (!previewWin) {\n        alert(\"Tab baru diblokir oleh browser. Izinkan popup untuk melihat pratinjau.\");\n        return;\n    }\n    previewWin.document.write('<html><head><title>Loading...</title></head><body style=\"font-family:sans-serif;text-align:center;padding:50px;\"><h2>Menyiapkan pratinjau... Harap tunggu.</h2></body></html>');\n"
        )
        
        # Replace the early returns
        content = content.replace(
            "alert(\"Error invoking _buildPreviewDocument: \" + e.toString());\n            return;",
            "if(previewWin) previewWin.close();\n            alert(\"Error invoking _buildPreviewDocument: \" + e.toString());\n            return;"
        )
        
        content = content.replace(
            "alert(\"Galat internal: Hasil dokumen pratinjau kosong. Type: \" + (typeof previewHtml));\n            return;",
            "if(previewWin) previewWin.close();\n            alert(\"Galat internal: Hasil dokumen pratinjau kosong. Type: \" + (typeof previewHtml));\n            return;"
        )
        
        content = content.replace(
            "const w = window.open(url, '_blank');\n        if (!w) {\n            alert(\"Tab baru diblokir oleh browser. Izinkan popup untuk melihat pratinjau.\");\n        }",
            "if(previewWin) { previewWin.location.href = url; }"
        )
        
        content = content.replace(
            "} catch(err) {\n        console.error('Error inside openReportPreview:', err);",
            "} catch(err) {\n        if(previewWin) previewWin.close();\n        console.error('Error inside openReportPreview:', err);"
        )

    # Fix previewReportTemplate
    if "const previewWin2 = window.open('', '_blank');" not in content:
        content = content.replace(
            "async function previewReportTemplate(id) {\n    try {\n        const res = await fetch(`/api/report_templates/${id}`);",
            "async function previewReportTemplate(id) {\n    const previewWin = window.open('', '_blank');\n    if (!previewWin) {\n        alert(\"Tab baru diblokir oleh browser. Izinkan popup untuk melihat pratinjau.\");\n        return;\n    }\n    previewWin.document.write('<html><head><title>Loading...</title></head><body style=\"font-family:sans-serif;text-align:center;padding:50px;\"><h2>Menyiapkan pratinjau... Harap tunggu.</h2></body></html>');\n    try {\n        const res = await fetch(`/api/report_templates/${id}`);"
        )
        
        content = content.replace(
            "alert(\"Failed to load template data.\");\n            return;",
            "if(previewWin) previewWin.close();\n            alert(\"Failed to load template data.\");\n            return;"
        )
        
        content = content.replace(
            "alert(\"Galat internal: Hasil dokumen pratinjau kosong (undefined).\");\n            return;",
            "if(previewWin) previewWin.close();\n            alert(\"Galat internal: Hasil dokumen pratinjau kosong (undefined).\");\n            return;"
        )
        
        content = content.replace(
            "const previewWin = window.open(url, '_blank');\n        if (!previewWin) {\n            alert(\"Tab baru diblokir oleh browser. Izinkan popup untuk melihat pratinjau.\");\n        }",
            "if(previewWin) { previewWin.location.href = url; }"
        )
        
        content = content.replace(
            "} catch (e) {\n        console.error(e);",
            "} catch (e) {\n        if(previewWin) previewWin.close();\n        console.error(e);"
        )
        
    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    fix_appjs('/Users/macbookpro/ErwanzCode/Pentago/static/js/app.js')
    print('Patched app.js successfully.')
