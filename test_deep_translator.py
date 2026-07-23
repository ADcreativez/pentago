from deep_translator import GoogleTranslator

translator = GoogleTranslator(source='id', target='en')
texts = ["Aplikasi ini rentan terhadap injeksi SQL", "Ini adalah teks kedua"]
res = translator.translate_batch(texts)
print(res)
