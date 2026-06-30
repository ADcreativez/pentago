import json
import re

with open('/Users/macbookpro/.gemini/antigravity-ide/brain/e5e1c834-829a-421d-abd5-7e12c58643ae/.system_generated/logs/transcript.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'RUN_COMMAND' and 'diff --git a/templates/index.html' in str(data.get('content', '')):
            print("Found diff for index.html!")
            with open('recovered_index.patch', 'w') as out:
                out.write(data['content'])
            
