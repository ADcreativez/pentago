from app import app, db, SystemSettings
from google import genai

with app.app_context():
    api_key_setting = SystemSettings.query.filter_by(key='gemini_api_key').first()
    if api_key_setting:
        client = genai.Client(api_key=api_key_setting.value)
        models = client.models.list()
        for m in models:
            print(m.name)
    else:
        print("No API key")
