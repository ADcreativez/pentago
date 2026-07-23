from deep_translator import GoogleTranslator
texts = [
    "5. Kesimpulan",
    "7. Lampiran",
    "Penambahan Finding",
    "1.3 Skenario Penetration Testing",
    "Pengantaran jasa yang dijelaskan pada ruang lingkup pekerjaan tidak mencakupi hal-hal berikut ini:- Vulnerability Assessment & Penetration Testing terhadap sistem di luar sistem yang tercantum di dokumen ini.- Masalah operasional atau disaster, yang bukan disebabkan oleh I3."
]
translator = GoogleTranslator(source='id', target='en')
res = translator.translate_batch(texts)
for o, t in zip(texts, res):
    print(o, "->", t)
