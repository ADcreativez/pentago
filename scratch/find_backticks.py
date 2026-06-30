with open('static/js/app.js') as f:
    for i, line in enumerate(f, 1):
        if 1670 <= i <= 1830:
            if '`' in line:
                print(f"Line {i}: {repr(line)}")
