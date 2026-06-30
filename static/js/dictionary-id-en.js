const ID_EN_DICTIONARY = {
    // Structural terms & titles
    "RINGKASAN EKSEKUTIF": "EXECUTIVE SUMMARY",
    "Ringkasan Eksekutif": "Executive Summary",
    "Latar Belakang": "Background",
    "Ruang Lingkup": "Scope of Work",
    "Skenario Penetration Testing": "Penetration Testing Scenario",
    "Batasan Pekerjaan": "Limitations of Work",
    "Timeline Kegiatan": "Timeline of Activities",
    "Ringkasan Temuan Celah Keamanan": "Summary of Vulnerability Findings",
    "METODOLOGI": "METHODOLOGY",
    "Risk Assessment": "Risk Assessment",
    "Penetration Testing Tools": "Penetration Testing Tools",
    "LAPORAN TEKNIS": "TECHNICAL REPORT",
    "Intelligence Gathering": "Intelligence Gathering",
    "Vulnerability Assessment": "Vulnerability Assessment",
    "Penetration Testing (Exploitation)": "Penetration Testing (Exploitation)",
    "Rincian Temuan": "Finding Details",
    "3.3.1 Rincian Temuan": "3.3.1 Finding Details",
    "3.3.1.1 Rincian Temuan": "3.3.1.1 Finding Details",
    "DAFTAR ISI": "TABLE OF CONTENTS",
    "PRATINJAU": "PREVIEW",
    "Tutup": "Close",
    "Pembuatan Laporan": "Report Creation",
    "Sistem Terdampak": "Affected System",
    "Judul Temuan": "Finding Title",
    "Nilai CVSS": "CVSS Score",
    "Klasifikasi Risiko": "Risk Classification",
    "Status Temuan": "Finding Status",
    "Status Retest": "Retest Status",
    "Tidak ada temuan": "No findings",
    "Tidak ada temuan kerentanan": "No vulnerability findings",

    // Vulnerability Levels
    "Kritis": "Critical",
    "Tinggi": "High",
    "Sedang": "Medium",
    "Rendah": "Low",
    "Informasi": "Info",

    // Month Names
    "Januari": "January",
    "Februari": "February",
    "Maret": "March",
    "April": "April",
    "Mei": "May",
    "Juni": "June",
    "Juli": "July",
    "Agustus": "August",
    "September": "September",
    "Oktober": "October",
    "November": "November",
    "Desember": "December",

    // Common Pentest Terminology
    "celah keamanan": "security vulnerability",
    "celah": "vulnerability",
    "kerentanan": "vulnerability",
    "pengujian penetrasi": "penetration testing",
    "audit keamanan": "security audit",
    "langkah reproduksi": "steps to reproduce",
    "bukti kerentanan": "proof of vulnerability",
    "bukti celah": "evidence of vulnerability",
    "rekomendasi perbaikan": "remediation recommendation",
    "langkah penyelesaian": "resolution steps",
    "dampak dari": "impact of",
    "kurangnya validasi": "lack of validation",
    "validasi input": "input validation",
    "parameter input": "input parameter",
    "tidak aman": "insecure",
    "kesalahan konfigurasi": "misconfiguration",
    "data sensitif": "sensitive data",
    "kredensial": "credentials",
    "permintaan HTTP": "HTTP request",
    "tanggapan HTTP": "HTTP response",
    "metode HTTP": "HTTP method",
    
    // Exact Sentences from user screenshots
    "Aktivitas kegiatan Vulnerability Assessment dan Penetration Testing dilakukan ok pada:": "Vulnerability Assessment and Penetration Testing activities were conducted on:",
    "Aktivitas kegiatan Vulnerability Assessment dan Penetration Testing dilakukan pada:": "Vulnerability Assessment and Penetration Testing activities were conducted on:",
    "Aktivitas kegiatan Vulnerability Assessment dan Penetration Testing dilakukan ok pada: 23 Juli 2026.": "Vulnerability Assessment and Penetration Testing activities were conducted on: July 23, 2026.",
    "Aktivitas kegiatan Vulnerability Assessment dan Penetration Testing dilakukan pada: 23 Juli 2026.": "Vulnerability Assessment and Penetration Testing activities were conducted on: July 23, 2026.",
    "Laporan teknis terbagi menjadi 3 bagian utama yaitu: Intelligence Gathering, Vulnerability Assessment dan Penetration Testing (Exploitation) yang menjelaskan setiap kerentanan keamanan yang ditemukan.": "The technical report is divided into 3 main parts: Intelligence Gathering, Vulnerability Assessment, and Penetration Testing (Exploitation) which explain each security vulnerability found.",
    "Pada tahap ini Pentester melakukan pemindaian kerentanan, mengklasifikasikan jenis kerentanan, mengukur severity berdasarkan CVSS, dan menginformasikan status celah keamanan tersebut.": "In this stage, the Pentester performs vulnerability scanning, classifies the type of vulnerability, measures severity based on CVSS, and informs the status of the security vulnerability.",
    "Alat: Burpsuite Pro, Acunetix, OWASP ZAP, Dalfox, Nessus Pro.": "Tools: Burpsuite Pro, Acunetix, OWASP ZAP, Dalfox, Nessus Pro.",
    "Pada tahap ini Pentester melanjutkan kegiatan eksploitasi berdasarkan hasil Vulnerability Assessment, untuk mensimulasikan serangan attacker yang sesungguhnya.": "In this stage, the Pentester continues exploitation activities based on the results of the Vulnerability Assessment to simulate attacks of a real attacker.",
    "Pada tahap ini Pentester melanjutkan kegiatan exploitasi berdasarkan hasil Vulnerability Assessment, untuk mensimulasikan serangan attacker yang sesungguhnya.": "In this stage, the Pentester continues exploitation activities based on the results of the Vulnerability Assessment to simulate attacks of a real attacker.",
    "Tahap pertama pengujian dimulai dengan proses pengumpulan informasi intelijen untuk menentukan jenis sistem operasi, tingkat patch, layanan yang berjalan, dll.": "The first stage of testing begins with the intelligence gathering process to determine the type of operating system, patch level, running services, etc.",

    // Common Template Sentences
    "sebagai pihak ketiga melakukan audit keamanan untuk aplikasi milik": "as a third party conducted a security audit for the application owned by",
    "yang diselenggarakan pada": "held on",
    "melalui pengujian penetrasi": "through penetration testing",
    "Tujuan dari pengujian ini adalah untuk mengidentifikasi kerentanan yang dapat dimanfaatkan oleh penyerang": "The purpose of this testing is to identify vulnerabilities that could be exploited by attackers",
    "melakukan scanning terkait informasi OS, port, dan celah yang terbuka sebagai pengguna internet, pengguna aplikasi, juga sebagai admin aplikasi": "performs scanning related to OS, port, and open vulnerabilities as an internet user, application user, and also as an admin",
    "Pengantaran jasa yang dijelaskan pada ruang lingkup pekerjaan tidak mencakupi hal-hal berikut ini": "Delivery of services described in the scope of work does not cover the following",
    "Vulnerability Assessment & Penetration Testing terhadap sistem di luar sistem yang tercantum di dokumen ini": "Vulnerability Assessment & Penetration Testing of systems outside the systems listed in this document",
    "Masalah operasional atau disaster, yang bukan disebabkan oleh I3": "Operational or disaster issues not caused by I3",
    "Aktivitas kegiatan Vulnerability Assessment dan Penetration Testing dilakukan pada": "Vulnerability Assessment and Penetration Testing activities were conducted on",
    "Bagian utama dari laporan ini menjelaskan setiap risiko yang ada secara rinci, diikuti dengan rekomendasi tentang langkah-langkah penyelesaian teknis": "The main part of this report explains each risk in detail, followed by recommendations on technical resolution steps",
    "menggunakan framework yang disesuaikan dengan target seperti": "uses frameworks tailored to targets such as",
    "Pengujian ini mengikuti standar industri seperti": "This testing follows industry standards such as",
    "dengan tahapan pengumpulan informasi, pemetaan kerentanan, eksploitasi, hingga analisis dampak": "with stages of information gathering, vulnerability mapping, exploitation, and impact analysis",
    "Perjanjian antar pihak dan aturan keterlibatan": "Agreement between parties and rules of engagement",
    "Mengumpulkan informasi secara aktif dan pasif": "Actively and passively collecting information",
    "Mencari celah (Vulnerability Assessment) dan mensimulasikan serangan": "Finding vulnerabilities (Vulnerability Assessment) and simulating attacks",
    "Melakukan testing (Penetration Testing) berdasarkan": "Performing testing (Penetration Testing) based on",
    "Menganalisis data and menuliskan laporan": "Analyzing data and writing the report",
    "Tahap pertama pengujian dimulai dengan proses pengumpulan informasi intelijen untuk menentukan jenis sistem operasi, tingkat patch, layanan yang berjalan, dll": "The first stage of testing begins with the intelligence gathering process to determine the type of operating system, patch level, running services, etc",
    "Alat yang digunakan": "Tools used",
    "Web Application Enumeration adalah fase pengujian penetrasi untuk menemukan dan mengumpulkan informasi tentang aplikasi dan teknologi yang digunakan di situs web": "Web Application Enumeration is the penetration testing phase to discover and gather information about the web application and technologies used in the website",
    "Pada tahap ini Pentester melakukan pemindaian kerentanan, mengklasifikasikan jenis kerentanan, mengukur severity berdasarkan CVSS, dan menginformasikan status celah keamanan tersebut": "In this stage, the Pentester performs vulnerability scanning, classifies the type of vulnerability, measures severity based on CVSS, and informs the status of the security vulnerability",
    "Pada tahap ini Pentester melanjutkan kegiatan exploitasi berdasarkan hasil Vulnerability Assessment, untuk mensimulasikan serangan attacker yang sesungguhnya": "In this stage, the Pentester continues exploitation activities based on the results of the Vulnerability Assessment to simulate attacks of a real attacker",
    "Laporan teknis terbagi menjadi 3 bagian utama yaitu": "The technical report is divided into 3 main parts:",
    "yang menjelaskan setiap kerentanan keamanan yang ditemukan": "which explain each security vulnerability found",
    
    // Verbs and prepositions
    "ditemukan pada": "found on",
    "memanfaatkan": "exploit",
    "mengakses": "access",
    "mengizinkan": "allow",
    "melakukan": "perform",
    "menggunakan": "use",
    "mencegah": "prevent",
    "mengirimkan": "send",
    "menampilkan": "display",
    "mengidentifikasi": "identify",
    
    // General Nouns
    "pengguna": "user",
    "penyerang": "attacker",
    "aplikasi": "application",
    "sistem": "system",
    "informasi": "information",
    "kredensial": "credentials",
    "halaman": "page",
    "parameter": "parameter",
    "permintaan": "request",
    "tanggapan": "response",
    "kesalahan konfigurasi": "misconfiguration",
    "perbaikan": "remediation",
    "rekomendasi": "recommendation",
    "solusi": "solution",
    "dampak": "impact",
    "deskripsi": "description",
    "tabel": "table",
    "gambar": "figure",
    
    // Connective words
    " karena ": " because ",
    " untuk ": " to ",
    " pada ": " on ",
    " dari ": " of ",
    " dengan ": " with ",
    " yang ": " which ",
    " adalah ": " is ",
    " tidak ": " not ",
    " dapat ": " can ",
    " akan ": " will "
};

function localTranslateText(text) {
    if (!text) return '';
    let translated = text;
    // Sort keys by length descending to replace longer sentences/phrases first
    const keys = Object.keys(ID_EN_DICTIONARY).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        // Safe escaping for regex
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'gi');
        translated = translated.replace(regex, (match) => {
            // Match case
            if (match === match.toUpperCase()) {
                return ID_EN_DICTIONARY[key].toUpperCase();
            }
            if (match[0] === match[0].toUpperCase()) {
                return ID_EN_DICTIONARY[key][0].toUpperCase() + ID_EN_DICTIONARY[key].slice(1);
            }
            return ID_EN_DICTIONARY[key];
        });
    }
    return translated;
}
