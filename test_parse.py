import re

try:
    with open('static/js/app.js', 'r') as f:
        content = f.read()
    # Check for obvious unbalanced braces or template literals
    open_braces = content.count('{')
    close_braces = content.count('}')
    print(f"Braces: {open_braces} open, {close_braces} close")
    
    open_parens = content.count('(')
    close_parens = content.count(')')
    print(f"Parens: {open_parens} open, {close_parens} close")
    
    backticks = content.count('`')
    print(f"Backticks: {backticks}")
except Exception as e:
    print(e)
