def verify_js_syntax(filepath):
    with open(filepath, 'r') as f:
        code = f.read()

    n = len(code)
    stack = []
    i = 0
    line = 1
    col = 1
    
    in_single = False
    in_double = False
    in_backtick = False
    
    while i < n:
        char = code[i]
        
        if line == 2048:
            print(f"AT LINE 2048, char='{char}' col={col}: stack={stack[-5:]}")

        # Track line & col
        if char == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        # Comments
        if not in_single and not in_double and not in_backtick:
            if char == '/' and i + 1 < n and code[i+1] == '/':
                while i < n and code[i] != '\n':
                    i += 1
                line += 1
                col = 1
                i += 1
                continue
            if char == '/' and i + 1 < n and code[i+1] == '*':
                i += 2
                col += 2
                while i + 1 < n and not (code[i] == '*' and code[i+1] == '/'):
                    if code[i] == '\n':
                        line += 1
                        col = 1
                    else:
                        col += 1
                    i += 1
                i += 2
                col += 2
                continue

        # String literals
        if char == "'" and not in_double and not in_backtick:
            if i > 0 and code[i-1] == '\\':
                # escaped
                pass
            else:
                in_single = not in_single
                i += 1
                continue
        elif char == '"' and not in_single and not in_backtick:
            if i > 0 and code[i-1] == '\\':
                # escaped
                pass
            else:
                in_double = not in_double
                i += 1
                continue
        elif char == '`' and not in_single and not in_double:
            if i > 0 and code[i-1] == '\\':
                # escaped
                pass
            else:
                in_backtick = not in_backtick
                i += 1
                continue

        # Brace tracking (only when not in strings)
        if not in_single and not in_double and not in_backtick:
            if char in '({[':
                stack.append((char, line, col))
            elif char in ')}]':
                if not stack:
                    print(f"Extra closing {char} at line {line}, col {col}")
                    return False
                opening, o_line, o_col = stack.pop()
                if (opening == '(' and char != ')') or \
                   (opening == '{' and char != '}') or \
                   (opening == '[' and char != ']'):
                    print(f"Mismatched {opening} at line {o_line}, col {o_col} closed by {char} at line {line}, col {col}")
                    return False

        i += 1

    if stack:
        print(f"Unclosed braces remaining: {len(stack)}")
        for item in stack[:5]:
            print(f"  {item[0]} at line {item[1]}, col {item[2]}")
        return False
        
    print("Braces are balanced perfectly!")
    return True

verify_js_syntax('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/app.js')
