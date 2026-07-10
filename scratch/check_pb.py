import sys
import re

def check_braces(filepath):
    with open(filepath, 'r') as f:
        code = f.read()
    
    # Very simple string/comment stripping
    code = re.sub(r'//.*', '', code)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    
    # Strip template literals properly (since they can contain braces)
    # but for simplicity let's just strip everything between backticks
    code = re.sub(r'`[^`]*`', '``', code)
    code = re.sub(r'"([^"\\]|\\.)*"', '""', code)
    code = re.sub(r"'([^'\\]|\\.)*'", "''", code)
    
    stack = []
    line = 1
    col = 1
    
    for i, char in enumerate(code):
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
                return
            opening, o_line, o_col = stack.pop()
            if (opening == '(' and char != ')') or \
               (opening == '{' and char != '}') or \
               (opening == '[' and char != ']'):
                print(f"Mismatched {opening} at line {o_line}, col {o_col} closed by {char} at line {line}, col {col}")
                return
                
    if stack:
        print(f"Unclosed braces remaining: {len(stack)}")
        for item in stack[:5]:
            print(f"  {item[0]} at line {item[1]}, col {item[2]}")
    else:
        print("Braces are balanced perfectly!")

check_braces('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js')
