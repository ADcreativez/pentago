import sys

def check(filepath):
    with open(filepath, 'r') as f:
        code = f.read()
    
    n = len(code)
    stack = []
    i = 0
    line = 1
    
    while i < n:
        char = code[i]
        if char == '\n':
            line += 1
        
        if char == '/' and i + 1 < n and code[i+1] == '/':
            while i < n and code[i] != '\n': i += 1
            continue
        if char == '/' and i + 1 < n and code[i+1] == '*':
            i += 2
            while i + 1 < n and not (code[i] == '*' and code[i+1] == '/'):
                if code[i] == '\n': line += 1
                i += 1
            i += 2
            continue
        if char == "'":
            i += 1
            while i < n and code[i] != "'":
                if code[i] == '\\': i += 2
                else:
                    if code[i] == '\n': line += 1
                    i += 1
            i += 1
            continue
        if char == '"':
            i += 1
            while i < n and code[i] != '"':
                if code[i] == '\\': i += 2
                else:
                    if code[i] == '\n': line += 1
                    i += 1
            i += 1
            continue
        if char == '`':
            i += 1
            while i < n and code[i] != '`':
                if code[i] == '\\': i += 2
                else:
                    if code[i] == '\n': line += 1
                    i += 1
            i += 1
            continue
            
        if char == '{':
            stack.append(('{', line))
        elif char == '}':
            if not stack:
                print(f"Extra }} at line {line}")
            else:
                top = stack[-1]
                if top[0] == '{':
                    stack.pop()
                else:
                    print(f"Mismatch at line {line}")
        i += 1
        
    print(f"Unclosed {{: {len(stack)}")
    for s in stack:
        print(f"  {{ at line {s[1]}")

check(sys.argv[1])
