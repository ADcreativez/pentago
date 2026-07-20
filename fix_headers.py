import sys

file_path = 'static/js/preview_builder.js'
with open(file_path, 'r') as f:
    content = f.read()

replacements = {
    '>Finding Title<': '>${lang === "en" ? "Finding Title" : "Judul Temuan"}<',
    '>Affected System<': '>${lang === "en" ? "Affected System" : "Sistem Terdampak"}<',
    '>CVSS Calculator<': '>${lang === "en" ? "CVSS Calculator" : "Kalkulator CVSS"}<',
    '>Finding Status<': '>${lang === "en" ? "Finding Status" : "Status Temuan"}<',
    '>Retest Status<': '>${lang === "en" ? "Retest Status" : "Status Retest"}<',
    '>Description<': '>${lang === "en" ? "Description" : "Deskripsi"}<',
    '>Proof of Vulnerability (PoC)<': '>${lang === "en" ? "Proof of Vulnerability (PoC)" : "Bukti Kerentanan (PoC)"}<',
    '>Exploitation<': '>${lang === "en" ? "Exploitation" : "Eksploitasi"}<',
    '>Impact<': '>${lang === "en" ? "Impact" : "Dampak"}<',
    '>Script/Payload<': '>${lang === "en" ? "Script/Payload" : "Skrip/Payload"}<',
    '>Solution<': '>${lang === "en" ? "Solution" : "Rekomendasi/Solusi"}<',
    '>References<': '>${lang === "en" ? "References" : "Referensi"}<',
    '>Steps to Reproduce<': '>${lang === "en" ? "Steps to Reproduce" : "Langkah Reproduksi"}<',
    '>MITRE ATT&CK Technique<': '>${lang === "en" ? "MITRE ATT&CK Technique" : "Teknik MITRE ATT&CK"}<',
    '>ISO 27001 Annex A Control<': '>${lang === "en" ? "ISO 27001 Annex A Control" : "Kontrol ISO 27001 Annex A"}<',
    '>NIST SP 800-53 Control<': '>${lang === "en" ? "NIST SP 800-53 Control" : "Kontrol NIST SP 800-53"}<',
    '>PTES Assessment Phase<': '>${lang === "en" ? "PTES Assessment Phase" : "Fase Penilaian PTES"}<',
    '>Retest Evidence<': '>${lang === "en" ? "Retest Evidence" : "Bukti Retest"}<'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)
