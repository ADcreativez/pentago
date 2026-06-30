import re

with open('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/app.js', 'r') as f:
    content = f.read()

# Strip comments
content_no_comments = re.sub(r'//.*', '', content)
content_no_comments = re.sub(r'/\*.*?\*/', '', content_no_comments, flags=re.DOTALL)

# Strip strings (double-quoted, single-quoted, backtick/template literals)
# Note: we replace strings with empty string to keep simple characters
# Replace double quoted strings
content_no_strings = re.sub(r'"([^"\\]|\\.)*"', '""', content_no_comments)
# Replace single quoted strings
content_no_strings = re.sub(r"'([^'\\]|\\.)*'", "''", content_no_strings)
# Replace template strings (backtick strings, ignoring dynamic expressions for simple checking)
content_no_strings = re.sub(r"`([^`\\]|\\.)*`", "``", content_no_strings)

stack = []
line = 1
col = 1
for i, char in enumerate(content_no_strings):
    if char == '\n':
        line += 1
        col = 1
    else:
        col += 1
    
    if char in '({[':
        stack.append((char, line, col))
    elif char in ')}]':
        if not stack:
            print(f"Extra closing {char} at line {line}, col {col}")
            break
        opening, o_line, o_col = stack.pop()
        if (opening == '(' and char != ')') or \
           (opening == '{' and char != '}') or \
           (opening == '[' and char != ']'):
            print(f"Mismatched {opening} at line {o_line}, col {o_col} closed by {char} at line {line}, col {col}")
            break
else:
    if stack:
        print(f"Unclosed braces remaining: {len(stack)}")
        for item in stack[:10]:
            print(f"  {item[0]} at line {item[1]}, col {item[2]}")
    else:
        print("Braces are balanced perfectly!")
