from app import app, db, SystemSettings
from google import genai
from google.genai import types
import json

with app.app_context():
    api_key_setting = SystemSettings.query.filter_by(key='gemini_api_key').first()
    client = genai.Client(api_key=api_key_setting.value)
    
    prompt = """
You are an expert penetration testing report translator.
Translate the following JSON array of HTML strings from Indonesian to English.
CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of strings in the exact same order as the input.
2. PRESERVE ALL HTML TAGS, attributes, inline styles, and classes exactly as they are. DO NOT REMOVE ANY HTML TAGS.
3. PRESERVE all placeholders like [[IMG_PLACEHOLDER_0]] exactly as they are.
4. Translate EVERY SINGLE WORD of the text content inside the HTML tags into professional English.
5. Do NOT wrap the JSON output in markdown backticks. Return the raw JSON array.
"""
    strings = ["<p>Ini adalah pengujian penetrasi untuk sistem web.</p>", "Tingkat Risiko: Sangat Tinggi"]
    
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=[prompt, json.dumps(strings)],
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )
    )
    print(response.text)
