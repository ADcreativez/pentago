import sys

def check_braces(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Remove strings and comments to avoid false positives
    import re
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'"(?:\\"|[^"])*"', '""', content)
    content = re.sub(r"'(?:\\'|[^'])*'", "''", content)
    content = re.sub(r"`(?:\\`|[^`])*`", "``", content)
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                stack.append((i+1, j+1))
            elif char == '}':
                if not stack:
                    print(f"Unmatched }} at line {i+1}, col {j+1}")
                else:
                    stack.pop()
    
    if stack:
        print("Unmatched { at:")
        for line, col in stack:
            print(f"Line {line}, Col {col}")

check_braces('static/js/app.js')
