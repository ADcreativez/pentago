with open('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/app.js', 'r') as f:
    lines = f.readlines()

# We only check lines 1629 to 2049
stack = []
in_single = False
in_double = False
in_backtick = False

for idx in range(1628, 2047):
    line_num = idx + 1
    line_content = lines[idx]
    
    # Strip comments unless we are in a string
    if not in_single and not in_double and not in_backtick:
        line_content = line_content.split('//')[0]
    
    col = 1
    for char in line_content:
        if char == "'" and not in_double and not in_backtick:
            if col > 1 and line_content[col-2] == '\\':
                pass
            else:
                in_single = not in_single
        elif char == '"' and not in_single and not in_backtick:
            if col > 1 and line_content[col-2] == '\\':
                pass
            else:
                in_double = not in_double
        elif char == '`' and not in_single and not in_double:
            if col > 1 and line_content[col-2] == '\\':
                pass
            else:
                in_backtick = not in_backtick
            
        if not in_single and not in_double and not in_backtick:
            if char in '({[':
                stack.append((char, line_num, col))
            elif char in ')}]':
                if not stack:
                    print(f"Extra closing {char} at line {line_num}, col {col}")
                    break
                opening, o_line, o_col = stack.pop()
                if (opening == '(' and char != ')') or \
                   (opening == '{' and char != '}') or \
                   (opening == '[' and char != ']'):
                    print(f"Mismatched {opening} at line {o_line}, col {o_col} closed by {char} at line {line_num}, col {col}")
                    break
        col += 1

if stack:
    print(f"Unclosed items inside loop: {len(stack)}")
    for item in stack:
        print(f"  {item[0]} at line {item[1]}, col {item[2]}")
else:
    print("All items balanced inside loop!")
