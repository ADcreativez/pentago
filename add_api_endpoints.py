import re
with open('app.py', 'r') as f:
    content = f.read()

endpoints_code = """
# System Settings API
@app.route('/api/settings', methods=['GET', 'POST'])
@login_required
@admin_required
def manage_settings():
    if request.method == 'GET':
        settings = SystemSettings.query.all()
        return jsonify({s.key: s.value for s in settings})
    else:
        data = request.json
        for key, value in data.items():
            setting = SystemSettings.query.filter_by(key=key).first()
            if setting:
                setting.value = value
                setting.updated_at = datetime.utcnow()
            else:
                setting = SystemSettings(key=key, value=value)
                db.session.add(setting)
        db.session.commit()
        log_audit("UPDATE_SETTINGS", "Updated system settings")
        return jsonify({'message': 'Settings updated successfully'})

# AI Translation API
@app.route('/api/translate_html', methods=['POST'])
@login_required
def translate_html():
    try:
        data = request.json
        html_content = data.get('html', '')
        if not html_content:
            return jsonify({'translated': ''})

        api_key_setting = SystemSettings.query.filter_by(key='gemini_api_key').first()
        if not api_key_setting or not api_key_setting.value:
            return jsonify({'error': 'Gemini API Key is not configured in System Settings.'}), 400

        import google.generativeai as genai
        genai.configure(api_key=api_key_setting.value)
        
        generation_config = {
          "temperature": 0.2,
          "top_p": 0.95,
          "top_k": 64,
          "max_output_tokens": 8192,
        }

        model = genai.GenerativeModel(
          model_name="gemini-1.5-pro-latest",
          generation_config=generation_config,
        )

        prompt = \"\"\"
You are an expert penetration testing report translator.
Your task is to translate the following HTML content from Indonesian to English.
CRITICAL INSTRUCTIONS:
1. PRESERVE ALL HTML TAGS, attributes, inline styles, and classes exactly as they are.
2. DO NOT wrap the output in markdown code blocks like ```html. Return ONLY the raw HTML string.
3. Translate ONLY the text content inside the HTML tags.
4. Maintain the professional tone of a cybersecurity report.

HTML CONTENT TO TRANSLATE:
\"\"\" + html_content

        response = model.generate_content(prompt)
        translated_text = response.text

        # Strip any markdown backticks if Gemini accidentally adds them
        if translated_text.startswith('```html'):
            translated_text = translated_text[7:]
        if translated_text.startswith('```'):
            translated_text = translated_text[3:]
        if translated_text.endswith('```'):
            translated_text = translated_text[:-3]
        
        return jsonify({'translated': translated_text.strip()})

    except Exception as e:
        print("Translation error:", e)
        return jsonify({'error': str(e)}), 500

"""

if '@app.route(\'/api/translate_html\'' not in content:
    # Find a good place to insert, e.g., before `if __name__ == '__main__':`
    # Let's just append it before `if __name__ == '__main__':`
    content = content.replace("if __name__ == '__main__':", endpoints_code + "\nif __name__ == '__main__':")
    with open('app.py', 'w') as f:
        f.write(content)
    print("Added endpoints")
else:
    print("Endpoints already exist")
