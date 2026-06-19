import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's clean the file but keep track of the original line number for each character
content_clean = []
in_multi_comment = False
in_single_comment = False
in_string = None  # ', ", or `
escape = False

idx = 0
line_num = 1
while idx < len(content):
    char = content[idx]
    
    if char == '\n':
        curr_line = line_num
        line_num += 1
    else:
        curr_line = line_num

    if escape:
        escape = False
        idx += 1
        continue
        
    if in_string:
        if char == '\\':
            escape = True
        elif char == in_string:
            in_string = None
        idx += 1
        continue
        
    if in_multi_comment:
        if content[idx:idx+2] == '*/':
            in_multi_comment = False
            idx += 2
        else:
            idx += 1
        continue
        
    if in_single_comment:
        if char == '\n':
            in_single_comment = False
        idx += 1
        continue
        
    if content[idx:idx+2] == '/*':
        in_multi_comment = True
        idx += 2
        continue
        
    if content[idx:idx+2] == '//':
        in_single_comment = True
        idx += 2
        continue

    # Simple regex literal detection
    # If we see a '/' and it is not part of a comment, let's skip to the closing '/'
    # To be simple: if we see / and it's followed by some characters and a close / on the same line
    if char == '/':
        # Look ahead on the same line
        eol = content.find('\n', idx)
        if eol == -1:
            eol = len(content)
        line_text = content[idx:eol]
        match = re.match(r'\/[^\/\n]+\/', line_text)
        if match:
            idx += match.end()
            continue

    if char in ['\'', '\"', '`']:
        in_string = char
        idx += 1
        continue
        
    content_clean.append((char, curr_line))
    idx += 1

# Bracket matching
stack = []
for clean_idx, (char, orig_line) in enumerate(content_clean):
    if char in '{[(':
        stack.append((char, orig_line, clean_idx))
    elif char in '}])':
        if not stack:
            print(f"Unmatched closing {char} at original line {orig_line}")
            # print surrounding characters
            context_chars = [c[0] for c in content_clean[max(0, clean_idx-100):min(len(content_clean), clean_idx+100)]]
            print("".join(context_chars))
            break
        top, top_orig_line, top_clean_idx = stack.pop()
        if (char == '}' and top != '{') or (char == ']' and top != '[') or (char == ')' and top != '('):
            print(f"Mismatch: '{top}' opened at line {top_orig_line} closed by '{char}' at line {orig_line}")
            break
else:
    if stack:
        print(f"Unclosed elements remaining: {len(stack)}")
        for char, line, _ in stack[:5]:
            print(f"  '{char}' at line {line}")
    else:
        print("Syntax check: Clean!")
