import json
import re

with open('dictionary_id_en.json', 'r') as f:
    ID_EN_DICTIONARY = json.load(f)

# Pre-compile the regexes for performance
# Sort keys by length descending
sorted_keys = sorted(ID_EN_DICTIONARY.keys(), key=len, reverse=True)
compiled_patterns = []
for key in sorted_keys:
    escaped = re.escape(key)
    compiled_patterns.append((re.compile(escaped, re.IGNORECASE), key, ID_EN_DICTIONARY[key]))

def translate_text_py(text):
    if not text:
        return ""
    translated = text
    for pattern, key, value in compiled_patterns:
        def repl(match):
            m = match.group(0)
            if m == m.upper():
                return value.upper()
            if m and m[0] == m[0].upper():
                return value[0].upper() + value[1:] if value else value
            return value
        translated = pattern.sub(repl, translated)
    return translated

print(translate_text_py("Ini adalah contoh celah keamanan Kritis."))
