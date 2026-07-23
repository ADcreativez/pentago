import re

with open('app.py', 'r') as f:
    content = f.read()

# I will replace the entire translate_html route with translate_report_data
new_code = """
import json
import re

def strip_base64_images(html_str, image_store):
    if not html_str:
        return html_str
    
    # Regex to match src="data:image/...;base64,..."
    pattern = r'src=["\'](data:image/[^;]+;base64,[^"\']+)["\']'
    
    def replacer(match):
        base64_data = match.group(1)
        placeholder = f"[[IMG_PLACEHOLDER_{len(image_store)}]]"
        image_store[placeholder] = base64_data
        return f'src="{placeholder}"'
        
    return re.sub(pattern, replacer, str(html_str))

def restore_base64_images(html_str, image_store):
    if not html_str:
        return html_str
    for placeholder, base64_data in image_store.items():
        html_str = html_str.replace(placeholder, base64_data)
    return html_str

@app.route('/api/translate_report_data', methods=['POST'])
@login_required
def translate_report_data():
    try:
        data = request.json
        project = data.get('project', {})
        findings = data.get('findings', [])
        structure = data.get('structure', [])
        
        api_key_setting = SystemSettings.query.filter_by(key='gemini_api_key').first()
        if not api_key_setting or not api_key_setting.value:
            return jsonify({'error': 'Gemini API Key is not configured in System Settings.'}), 400

        image_store = {}
        strings_to_translate = []
        mapping = [] # to remember where to put the translated string back

        # Helper to queue a string for translation
        def queue_for_translation(obj, key, field_path):
            val = obj.get(key)
            if val and isinstance(val, str) and val.strip():
                stripped_val = strip_base64_images(val, image_store)
                strings_to_translate.append(stripped_val)
                mapping.append((obj, key))

        # Project fields
        for k in ['assignment_target', 'access_info', 'scope_of_work', 'technical_report']:
            queue_for_translation(project, k, 'project')
            
        # Findings fields
        for f in findings:
            for k in ['title', 'vulnerability_name', 'description', 'impact', 'recommendation', 'proof_of_concept']:
                queue_for_translation(f, k, 'finding')
                
        # Structure fields
        for s in structure:
            queue_for_translation(s, 'title', 'structure')
            queue_for_translation(s, 'content', 'structure')

        if not strings_to_translate:
            return jsonify({'project': project, 'findings': findings, 'structure': structure})

        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key_setting.value)
        
        prompt = \"\"\"
You are an expert penetration testing report translator.
Translate the following JSON array of HTML strings from Indonesian to English.
CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of strings in the exact same order as the input.
2. PRESERVE ALL HTML TAGS, attributes, inline styles, and classes exactly as they are. DO NOT REMOVE ANY HTML TAGS.
3. PRESERVE all placeholders like [[IMG_PLACEHOLDER_0]] exactly as they are.
4. Translate EVERY SINGLE WORD of the text content inside the HTML tags into professional English.
5. Do NOT wrap the JSON output in markdown backticks. Return the raw JSON array.
\"\"\"
        
        # We process in batches to avoid overwhelming the model or hitting output limits
        BATCH_SIZE = 15
        translated_strings = []
        
        for i in range(0, len(strings_to_translate), BATCH_SIZE):
            batch = strings_to_translate[i:i+BATCH_SIZE]
            
            response = client.models.generate_content(
                model='gemini-1.5-pro',
                contents=[prompt, json.dumps(batch)],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )
            
            batch_result = json.loads(response.text)
            
            # Ensure it is a list of the same length
            if not isinstance(batch_result, list) or len(batch_result) != len(batch):
                raise ValueError(f"AI returned invalid format or mismatched length for batch. Expected {len(batch)}, got {len(batch_result) if isinstance(batch_result, list) else type(batch_result)}")
                
            translated_strings.extend(batch_result)

        # Restore mapping and images
        for i, trans_str in enumerate(translated_strings):
            obj, key = mapping[i]
            restored = restore_base64_images(trans_str, image_store)
            obj[key] = restored

        return jsonify({'project': project, 'findings': findings, 'structure': structure})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
"""

# Now we need to replace the old /api/translate_html with the new code
# We find the old function
start_marker = "@app.route('/api/translate_html'"
end_marker = "if __name__ == '__main__':"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_code + "\n" + content[end_idx:]
    with open('app.py', 'w') as f:
        f.write(new_content)
    print("Replaced translate_html with translate_report_data")
else:
    print("Could not find markers to replace")

