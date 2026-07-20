import sys

def check(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    code = "".join(lines)
    n = len(code)
    i = 0
    line_num = 1
    level = 0
    
    # Simple brace counter per line (ignoring strings/comments)
    while i < n:
        char = code[i]
        if char == '\n':
            line_num += 1
        
        if char == '/' and i + 1 < n and code[i+1] == '/':
            while i < n and code[i] != '\n': i += 1
            continue
        if char == '/' and i + 1 < n and code[i+1] == '*':
            i += 2
            while i + 1 < n and not (code[i] == '*' and code[i+1] == '/'):
                if code[i] == '\n': line_num += 1
                i += 1
            i += 2
            continue
        if char == "'":
            i += 1
            while i < n and code[i] != "'":
                if code[i] == '\\': i += 2
                else:
                    if code[i] == '\n': line_num += 1
                    i += 1
            i += 1
            continue
        if char == '"':
            i += 1
            while i < n and code[i] != '"':
                if code[i] == '\\': i += 2
                else:
                    if code[i] == '\n': line_num += 1
                    i += 1
            i += 1
            continue
        if char == '`':
            i += 1
            while i < n and code[i] != '`':
                if code[i] == '\\': i += 2
                else:
                    if code[i] == '\n': line_num += 1
                    i += 1
            i += 1
            continue
            
        if char == '{':
            level += 1
        elif char == '}':
            level -= 1
            if level < 0:
                print(f"Extra }} at line {line_num}")
                
        i += 1
        
    # let's just count braces per line and compare with physical indentation
    pass

check(sys.argv[1])
