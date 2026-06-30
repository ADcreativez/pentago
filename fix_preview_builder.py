import re

with open('static/js/preview_builder.js', 'r') as f:
    content = f.read()

# Replace Executive Summary text
old_exec_sum = """    // --- BAB 1 ---
    const execSummaryPart1 = `
    <h2 class="sh-blue">${tr("1. RINGKASAN EKSEKUTIF")}</h2>
    <h3 class="ssh">${tr("1.1. Latar Belakang")}</h3>
    <div class="tb">${renderContent(p.description)}</div>

    <h3 class="ssh">${tr("1.2. Tujuan")}</h3>
    <div class="tb">${renderContent(bgText || (lang === 'en' ? 'The purpose of this penetration test is to identify and assess security vulnerabilities in the systems, applications, and network infrastructure, and to provide actionable recommendations for mitigating those risks to improve overall security posture.' : 'Tujuan dari penetration test ini adalah mengidentifikasi dan menilai kerentanan keamanan pada sistem, aplikasi, dan infrastruktur jaringan, serta memberikan rekomendasi yang dapat ditindaklanjuti untuk memitigasi risiko tersebut demi meningkatkan postur keamanan secara keseluruhan.'))}</div>

    <h3 class="ssh">${tr("1.3. Ruang Lingkup")}</h3>
    <div class="tb">${renderContent(p.scope || '-')}</div>

    <h3 class="ssh">${tr("1.4. Batasan Pekerjaan")}</h3>
    <div class="tb">${renderContent(p.out_of_scope || (lang === 'en' ? 'Delivery of services described in the scope of work does not cover the following:\\n- Vulnerability Assessment & Penetration Testing of systems outside the systems listed in this document.\\n- Operational or disaster issues not caused by I3.' : 'Pengantaran jasa yang dijelaskan pada ruang lingkup pekerjaan tidak mencakupi hal-hal berikut ini:\\n- Vulnerability Assessment & Penetration Testing terhadap sistem di luar sistem yang tercantum di dokumen ini.\\n- Masalah operasional atau disaster, yang bukan disebabkan oleh I3.'))}</div>
    `;"""

new_exec_sum = """    // --- BAB 1 ---
    const customExec = p.exec_summary && p.exec_summary.trim() ? renderContent(p.exec_summary) : null;
    const execSummaryPart1 = customExec ? `
    <h2 class="sh-blue">${tr("1. RINGKASAN EKSEKUTIF")}</h2>
    <div class="tb">${customExec}</div>
    ` : `
    <h2 class="sh-blue">${tr("1. RINGKASAN EKSEKUTIF")}</h2>
    <h3 class="ssh">${tr("1.1. Latar Belakang")}</h3>
    <div class="tb">${renderContent(p.description)}</div>

    <h3 class="ssh">${tr("1.2. Tujuan")}</h3>
    <div class="tb">${renderContent(bgText || (lang === 'en' ? 'The purpose of this penetration test is to identify and assess security vulnerabilities in the systems, applications, and network infrastructure, and to provide actionable recommendations for mitigating those risks to improve overall security posture.' : 'Tujuan dari penetration test ini adalah mengidentifikasi dan menilai kerentanan keamanan pada sistem, aplikasi, dan infrastruktur jaringan, serta memberikan rekomendasi yang dapat ditindaklanjuti untuk memitigasi risiko tersebut demi meningkatkan postur keamanan secara keseluruhan.'))}</div>

    <h3 class="ssh">${tr("1.3. Ruang Lingkup")}</h3>
    <div class="tb">${renderContent(p.scope || '-')}</div>

    <h3 class="ssh">${tr("1.4. Batasan Pekerjaan")}</h3>
    <div class="tb">${renderContent(p.out_of_scope || (lang === 'en' ? 'Delivery of services described in the scope of work does not cover the following:\\n- Vulnerability Assessment & Penetration Testing of systems outside the systems listed in this document.\\n- Operational or disaster issues not caused by I3.' : 'Pengantaran jasa yang dijelaskan pada ruang lingkup pekerjaan tidak mencakupi hal-hal berikut ini:\\n- Vulnerability Assessment & Penetration Testing terhadap sistem di luar sistem yang tercantum di dokumen ini.\\n- Masalah operasional atau disaster, yang bukan disebabkan oleh I3.'))}</div>
    `;"""

if 'const customExec = p.exec_summary' not in content:
    content = content.replace(old_exec_sum, new_exec_sum)

# Replace Methodology text
old_method_part1 = """    const methIntro = `
    <h2 class="sh-blue">${tr("2. METODOLOGI")}</h2>
    <div class="tb">${renderContent(methText || (lang === 'en' ? 'The methodology used in this penetration testing follows industry best practices to ensure comprehensive and consistent security assessment.' : 'Metodologi yang digunakan dalam penetration testing ini mengikuti praktik terbaik industri untuk memastikan penilaian keamanan yang komprehensif dan konsisten.'))}</div>
    `;"""

new_method_part1 = """    const methIntro = `
    <h2 class="sh-blue">${tr("2. METODOLOGI")}</h2>
    <div class="tb">${p.methodology_text && p.methodology_text.trim() ? renderContent(p.methodology_text) : renderContent(methText || (lang === 'en' ? 'The methodology used in this penetration testing follows industry best practices to ensure comprehensive and consistent security assessment.' : 'Metodologi yang digunakan dalam penetration testing ini mengikuti praktik terbaik industri untuk memastikan penilaian keamanan yang komprehensif dan konsisten.'))}</div>
    `;"""

if 'p.methodology_text && p.methodology_text.trim()' not in content:
    content = content.replace(old_method_part1, new_method_part1)

with open('static/js/preview_builder.js', 'w') as f:
    f.write(content)
