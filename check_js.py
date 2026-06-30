def check_brackets(filename):
    with open(filename, 'r') as f:
        text = f.read()
    
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in '({[':
                stack.append((char, i+1, j+1))
            elif char in ')}]':
                if not stack:
                    return f"Unmatched {char} at line {i+1} col {j+1}"
                top_char, top_line, top_col = stack.pop()
                if pairs[char] != top_char:
                    return f"Mismatched {char} at line {i+1} col {j+1}, expected to close {top_char} from line {top_line}"
    if stack:
        return f"Unclosed brackets: {stack}"
    return "OK"

print(check_brackets('static/js/app.js'))
