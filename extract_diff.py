import json

with open('/Users/macbookpro/.gemini/antigravity-ide/brain/e5e1c834-829a-421d-abd5-7e12c58643ae/.system_generated/logs/transcript.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'RUN_COMMAND' and 'diff --git a/app.py' in str(data.get('content', '')):
            print("FOUND IT!")
            with open('recovered_app.patch', 'w') as out:
                out.write(data['content'])
            break
