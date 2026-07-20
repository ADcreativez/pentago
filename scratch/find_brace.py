import sys

def find_matching(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    stack = []
    for line_idx, line in enumerate(lines):
        for col_idx, char in enumerate(line):
            if char == '{':
                stack.append((line_idx + 1, col_idx + 1))
            elif char == '}':
                if stack:
                    start = stack.pop()
                    # If this is the second to last line (e.g. 1787)
                    if line_idx >= len(lines) - 20:
                        print(f"Closing '}}' at line {line_idx + 1} matches '{{' at line {start[0]}")
                else:
                    print(f"Unmatched '}}' at line {line_idx + 1}")

find_matching(sys.argv[1])
