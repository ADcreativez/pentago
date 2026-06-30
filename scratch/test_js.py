import sys

def check_balance(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    stack = []
    in_string = None # None, "'", '"', '`'
    escaped = False
    in_line_comment = False
    in_block_comment = False
    
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        if in_line_comment:
            in_line_comment = False
        
        i = 0
        while i < len(line):
            char = line[i]
            
            if escaped:
                escaped = False
                i += 1
                continue
                
            if in_block_comment:
                if char == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_block_comment = False
                    i += 2
                else:
                    i += 1
                continue
                
            if in_line_comment:
                break
                
            if in_string:
                if char == '\\':
                    escaped = True
                elif char == in_string:
                    in_string = None
                i += 1
                continue
                
            # Check for comments start
            if char == '/' and i + 1 < len(line) and line[i+1] == '/':
                in_line_comment = True
                break
            elif char == '/' and i + 1 < len(line) and line[i+1] == '*':
                in_block_comment = True
                i += 2
                continue
                
            # Check for string starts
            if char in ("'", '"', '`'):
                in_string = char
                i += 1
                continue
                
            # Brackets balance
            if char in '({[':
                stack.append((char, line_num, i + 1))
            elif char in ')}]':
                if not stack:
                    print(f"Error in {filepath}: Unmatched closing '{char}' at line {line_num}, col {i + 1}")
                    return False
                top, l, c = stack.pop()
                if (char == ')' and top != '(') or \
                   (char == '}' and top != '{') or \
                   (char == ']' and top != '['):
                    print(f"Error in {filepath}: Mismatched '{char}' at line {line_num}, col {i + 1} (matches '{top}' from line {l}, col {c})")
                    return False
            i += 1
            
    if stack:
        print(f"Error in {filepath}: Unclosed brackets left at end of file:")
        for top, l, c in stack:
            print(f"  '{top}' from line {l}, col {c}")
        return False
    print(f"File {filepath} is fully balanced.")
    return True

check_balance('static/js/app.js')
check_balance('static/js/preview_builder.js')
