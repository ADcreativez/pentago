from bs4 import BeautifulSoup
import re
import json

with open('dictionary_id_en.json', 'r') as f:
    ID_EN_DICTIONARY = json.load(f)

sorted_keys = sorted(ID_EN_DICTIONARY.keys(), key=len, reverse=True)
TRANSLATION_PATTERNS = []
for key in sorted_keys:
    escaped = re.escape(key)
    TRANSLATION_PATTERNS.append((re.compile(escaped, re.IGNORECASE), key, ID_EN_DICTIONARY[key]))

def translate_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    for text_node in soup.find_all(string=True):
        if text_node.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
            continue
        original_text = text_node.string
        if not original_text or not original_text.strip():
            continue
            
        translated = original_text
        for pattern, key, value in TRANSLATION_PATTERNS:
            def repl(match):
                m = match.group(0)
                if m == m.upper():
                    return value.upper()
                if m and m[0] == m[0].upper():
                    return value[0].upper() + value[1:] if value else value
                return value
            translated = pattern.sub(repl, translated)
            
        if translated != original_text:
            text_node.replace_with(translated)
            
    return str(soup)

html = '<div class="Informasi"><img src="data:image/png;base64,IniAdalahInformasiKritis">Ini adalah informasi kritis.</div>'
print(translate_html(html))
