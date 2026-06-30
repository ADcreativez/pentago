def check():
    content = open('static/js/preview_builder.js', 'r', encoding='utf-8').read()
    in_multi_comment = False
    in_single_comment = False
    in_string = None
    escape = False
    idx = 0
    line_num = 1
    stack = []
    
    while idx < len(content):
        char = content[idx]
        if char == '\n':
            line_num += 1

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
        if char in ['\'', '\"', '`']:
            in_string = char
            idx += 1
            continue
            
        if char in '{[(':
            stack.append((char, line_num))
        elif char in '}])':
            if stack:
                top, l = stack.pop()
            else:
                print(f"Unmatched closing '{char}' at line {line_num}")
                return
        idx += 1

    if stack:
        print(f"Unclosed elements remaining: {len(stack)}")
        for char, line in stack:
            print(f"  '{char}' at line {line}")
    else:
        print("Clean!")

check()
