from app import app, db, SystemSettings
from google import genai
from google.genai import types
import json

with app.app_context():
    api_key_setting = SystemSettings.query.filter_by(key='gemini_api_key').first()
    client = genai.Client(api_key=api_key_setting.value)
    
    strings = ["<p>Ini adalah pengujian penetrasi untuk sistem web.</p>", "Tingkat Risiko: Sangat Tinggi"]
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=["Translate to english", json.dumps(strings)],
        )
        print("gemini-2.5-flash-lite SUCCESS:", response.text)
    except Exception as e:
        print("gemini-2.5-flash-lite ERROR:", e)
