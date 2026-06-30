def check_braces(filepath):
    with open(filepath, 'r') as f:
        code = f.read()
    
    n = len(code)
    stack = []
    i = 0
    line = 1
    col = 1
    
    while i < n:
        char = code[i]
        
        # Track line and column
        if char == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        # Ignore line comment
        if char == '/' and i + 1 < n and code[i+1] == '/':
            while i < n and code[i] != '\n':
                i += 1
            line += 1
            col = 1
            i += 1
            continue
            
        # Ignore block comment
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
            
        # Ignore string single quote
        if char == "'":
            i += 1
            col += 1
            while i < n and code[i] != "'":
                if code[i] == '\\':
                    i += 2
                    col += 2
                else:
                    if code[i] == '\n':
                        line += 1
                        col = 1
                    else:
                        col += 1
                    i += 1
            i += 1
            col += 1
            continue
            
        # Ignore string double quote
        if char == '"':
            i += 1
            col += 1
            while i < n and code[i] != '"':
                if code[i] == '\\':
                    i += 2
                    col += 2
                else:
                    if code[i] == '\n':
                        line += 1
                        col = 1
                    else:
                        col += 1
                    i += 1
            i += 1
            col += 1
            continue
            
        # Ignore template literal backtick
        if char == '`':
            i += 1
            col += 1
            while i < n and code[i] != '`':
                # Note: template literals can have nested expressions ${}, but for simple brace checking,
                # we just skip backticks unless we want to track nested ${} braces.
                # If we track nested, let's do it simply by checking if we see ${
                if code[i] == '$' and i + 1 < n and code[i+1] == '{':
                    # We enter a brace context. Push the backtick state or let the regular brace check handle it.
                    # Actually, if we just let the parser process the inside of ${} as normal JS code, we only need to ignore the rest of the template literal.
                    # To do that, we can push a state 'TEMPLATE' to a template stack, and process until matching }.
                    pass
                if code[i] == '\\':
                    i += 2
                    col += 2
                else:
                    if code[i] == '\n':
                        line += 1
                        col = 1
                    else:
                        col += 1
                    i += 1
            i += 1
            col += 1
            continue
            
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

check_braces('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/app.js')
