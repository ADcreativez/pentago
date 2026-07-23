import json

tech_report_raw = '[{"id": "sec-1", "title": "Bab 1: Ringkasan Eksekutif"}]'
tech_report_parsed = json.loads(tech_report_raw)

mapping = []
strings_to_translate = []

for sec in tech_report_parsed:
    strings_to_translate.append(sec['title'])
    mapping.append((sec, 'title'))

translated_strings = ["Chapter 1: Executive Summary"]

for i, trans_str in enumerate(translated_strings):
    obj, key = mapping[i]
    obj[key] = trans_str

print(json.dumps(tech_report_parsed))
